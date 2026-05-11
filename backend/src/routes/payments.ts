import type { FastifyInstance } from "fastify";
import {
  ActivityAction,
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus
} from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { getCommissionRepUserId } from "../services/commissionRep.js";
import { commissionAmountCents } from "../services/leadFsm.js";
import { logActivity } from "../services/activityLog.js";
import {
  assertPaymentMatchesQuoteTolerance,
  getPortalSettings,
  getRequiredLeadStatusForVerify
} from "../services/settings.js";
import { verifyPaymentBodySchema } from "../validators/schemas.js";

export async function registerPaymentRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/payments/:paymentId/verify",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { paymentId } = request.params as { paymentId: string };
      const body = verifyPaymentBodySchema.parse(request.body);

      const result = await app.prisma.$transaction(async (tx) => {
        const settings = await getPortalSettings(tx);
        const payment = await tx.leadPayment.findUnique({
          where: { id: paymentId },
          include: { lead: true }
        });
        if (!payment) {
          throw new HttpError(404, "NOT_FOUND", "Payment not found.");
        }
        if (payment.verificationStatus !== PaymentVerificationStatus.PENDING) {
          throw new HttpError(400, "ALREADY_PROCESSED", "This payment was already verified or rejected.");
        }

        const decision =
          body.decision === "VERIFIED"
            ? PaymentVerificationStatus.VERIFIED
            : PaymentVerificationStatus.REJECTED;

        // Atomic: only flip a still-PENDING payment. Concurrent verifies see 0 rows and bail.
        const payClaim = await tx.leadPayment.updateMany({
          where: { id: paymentId, verificationStatus: PaymentVerificationStatus.PENDING },
          data: {
            verificationStatus: decision,
            verifiedByUserId: admin.id,
            verifiedAt: new Date(),
            adminNote: body.adminNote ?? undefined
          }
        });
        if (payClaim.count === 0) {
          throw new HttpError(400, "ALREADY_PROCESSED", "This payment was already verified or rejected.");
        }
        const updatedPayment = await tx.leadPayment.findUniqueOrThrow({ where: { id: paymentId } });

        if (decision === PaymentVerificationStatus.REJECTED) {
          await logActivity({
            prisma: app.prisma,
            tx,
            userId: admin.id,
            action: ActivityAction.PAYMENT_VERIFIED,
            entityType: "LeadPayment",
            entityId: paymentId,
            after: { decision: body.decision, leadStatus: payment.lead.status },
            request
          });
          return { payment: updatedPayment, lead: payment.lead };
        }

        if (payment.kind === PaymentKind.ADVANCE) {
          const required = getRequiredLeadStatusForVerify(settings, "ADVANCE");
          assertPaymentMatchesQuoteTolerance(
            payment.amountCents,
            payment.lead.advanceAmountCents,
            settings.enforcePaymentQuoteToleranceBps,
            "Advance payment"
          );
          // Atomic state transition - eliminates the read-then-write race.
          const leadFlip = await tx.lead.updateMany({
            where: { id: payment.leadId, status: required },
            data: { status: LeadStatus.ADVANCE_PAID }
          });
          if (leadFlip.count === 0) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              `Lead must be ${required} to verify an advance payment.`
            );
          }
          const lead = await tx.lead.findUniqueOrThrow({ where: { id: payment.leadId } });
          await logActivity({
            prisma: app.prisma,
            tx,
            userId: admin.id,
            action: ActivityAction.PAYMENT_VERIFIED,
            entityType: "LeadPayment",
            entityId: paymentId,
            after: { decision: body.decision, leadStatus: lead.status },
            request
          });
          return { payment: updatedPayment, lead };
        }

        // FINAL
        const required = getRequiredLeadStatusForVerify(settings, "FINAL");
        assertPaymentMatchesQuoteTolerance(
          payment.amountCents,
          payment.lead.finalQuoteCents,
          settings.enforcePaymentQuoteToleranceBps,
          "Final payment"
        );
        const leadFlip = await tx.lead.updateMany({
          where: { id: payment.leadId, status: required },
          data: { status: LeadStatus.FINAL_PAID }
        });
        if (leadFlip.count === 0) {
          throw new HttpError(
            400,
            "INVALID_STATE",
            `Lead must be ${required} to verify a final payment.`
          );
        }
        // Re-read so commission math uses the latest finalQuoteCents (defends against a concurrent PATCH).
        const lead = await tx.lead.findUniqueOrThrow({ where: { id: payment.leadId } });
        const repId = getCommissionRepUserId(lead);
        const amountCents = commissionAmountCents(lead, payment.amountCents, settings);
        await tx.commission.upsert({
          where: { leadId: payment.leadId },
          create: {
            leadId: payment.leadId,
            repUserId: repId,
            amountCents
          },
          update: {
            repUserId: repId,
            amountCents
          }
        });
        await logActivity({
          prisma: app.prisma,
          tx,
          userId: admin.id,
          action: ActivityAction.PAYMENT_VERIFIED,
          entityType: "LeadPayment",
          entityId: paymentId,
          after: { decision: body.decision, leadStatus: lead.status },
          request
        });
        return { payment: updatedPayment, lead };
      });

      return reply.send(result);
    }
  );
}
