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
      const settings = await getPortalSettings(app.prisma);

      const result = await app.prisma.$transaction(async (tx) => {
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

        const updatedPayment = await tx.leadPayment.update({
          where: { id: paymentId },
          data: {
            verificationStatus: decision,
            verifiedByUserId: admin.id,
            verifiedAt: new Date(),
            adminNote: body.adminNote ?? undefined
          }
        });

        if (decision === PaymentVerificationStatus.REJECTED) {
          return { payment: updatedPayment, lead: payment.lead };
        }

        const requiredAdvance = getRequiredLeadStatusForVerify(settings, "ADVANCE");
        const requiredFinal = getRequiredLeadStatusForVerify(settings, "FINAL");

        if (payment.kind === PaymentKind.ADVANCE) {
          if (payment.lead.status !== requiredAdvance) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              `Lead must be ${requiredAdvance} to verify an advance payment.`
            );
          }
          assertPaymentMatchesQuoteTolerance(
            payment.amountCents,
            payment.lead.advanceAmountCents,
            settings.enforcePaymentQuoteToleranceBps,
            "Advance payment"
          );
          const lead = await tx.lead.update({
            where: { id: payment.leadId },
            data: { status: LeadStatus.ADVANCE_PAID }
          });
          return { payment: updatedPayment, lead };
        }

        if (payment.kind === PaymentKind.FINAL) {
          if (payment.lead.status !== requiredFinal) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              `Lead must be ${requiredFinal} to verify a final payment.`
            );
          }
          assertPaymentMatchesQuoteTolerance(
            payment.amountCents,
            payment.lead.finalQuoteCents,
            settings.enforcePaymentQuoteToleranceBps,
            "Final payment"
          );
          const lead = await tx.lead.update({
            where: { id: payment.leadId },
            data: { status: LeadStatus.FINAL_PAID }
          });
          const repId = getCommissionRepUserId(payment.lead);
          const amountCents = commissionAmountCents(payment.lead, payment.amountCents, settings);
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
          return { payment: updatedPayment, lead };
        }

        return { payment: updatedPayment, lead: payment.lead };
      });

      await logActivity({
        prisma: app.prisma,
        userId: admin.id,
        action: ActivityAction.PAYMENT_VERIFIED,
        entityType: "LeadPayment",
        entityId: paymentId,
        after: {
          decision: body.decision,
          leadStatus: result.lead.status
        },
        request
      });

      return reply.send(result);
    }
  );
}
