import type { FastifyInstance } from "fastify";
import {
  ActivityAction,
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  Prisma
} from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { logActivity } from "../services/activityLog.js";
import {
  assertPaymentMatchesQuoteTolerance,
  getPortalSettings,
  getRequiredLeadStatusForVerify
} from "../services/settings.js";
import { verifyPaymentBodySchema, pendingPaymentsQuerySchema } from "../validators/schemas.js";
import { notifyActiveAdmins, notifyRepOfAdminDecision } from "../services/notifications.js";
import { PortalNotificationKind, UserRole } from "@prisma/client";
import { getPipelineStages } from "../services/pipeline.js";

const paymentLeadDetailInclude = {
  payments: { orderBy: { markedAt: "desc" as const } },
  commission: true,
  project: true,
  websiteTemplate: true
} satisfies Prisma.LeadInclude;

async function paymentVerifyLeadDetail(
  tx: Prisma.TransactionClient,
  leadId: string,
  settings: Awaited<ReturnType<typeof getPortalSettings>>
) {
  const lead = await tx.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: paymentLeadDetailInclude
  });
  const pipelineStages = getPipelineStages(lead, settings, UserRole.ADMIN);
  return { lead, pipelineStages };
}

export async function registerPaymentRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/payments/pending/count",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const total = await app.prisma.leadPayment.count({
        where: { verificationStatus: PaymentVerificationStatus.PENDING }
      });
      return reply.send({ total });
    }
  );

  app.get(
    "/api/payments/pending",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const query = pendingPaymentsQuerySchema.parse(request.query);

      const leadWhere: Prisma.LeadWhereInput = {
        ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {}),
        ...(query.search
          ? {
              clientName: { contains: query.search, mode: "insensitive" as const }
            }
          : {})
      };

      const where: Prisma.LeadPaymentWhereInput = {
        verificationStatus: PaymentVerificationStatus.PENDING,
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.from || query.to
          ? {
              markedAt: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {})
              }
            }
          : {}),
        ...(Object.keys(leadWhere).length > 0 ? { lead: leadWhere } : {})
      };

      const total = await app.prisma.leadPayment.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.leadPayment.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { markedAt: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              clientName: true,
              assignedToUserId: true
            }
          },
          markedBy: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );

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
        const externalReference = body.decision === "VERIFIED" ? body.externalReference.trim() : null;

        const payClaim = await tx.leadPayment.updateMany({
          where: { id: paymentId, verificationStatus: PaymentVerificationStatus.PENDING },
          data: {
            verificationStatus: decision,
            verifiedByUserId: admin.id,
            verifiedAt: new Date(),
            adminNote: body.adminNote ?? undefined,
            externalReference
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
            after: {
              decision: body.decision,
              leadStatus: payment.lead.status,
              adminNote: body.adminNote ?? null
            },
            request
          });
          const repId = payment.lead.assignedToUserId ?? payment.lead.createdByUserId;
          const payNote = body.adminNote?.trim() ? ` Note: ${body.adminNote.trim()}` : "";
          const declineMessage = `${payment.lead.clientName}: ${payment.kind} payment declined.${payNote}`;
          const stageKey =
            payment.kind === PaymentKind.ADVANCE ? "advance_verify" : "final_verify";
          await notifyRepOfAdminDecision(tx, {
            leadId: payment.leadId,
            repUserId: repId,
            kind: PortalNotificationKind.ADMIN_DECLINED,
            stageKey,
            message: declineMessage
          });
          await notifyActiveAdmins(tx, {
            leadId: payment.leadId,
            kind: PortalNotificationKind.ADMIN_DECLINED,
            stageKey,
            message: declineMessage,
            excludeUserId: admin.id
          });
          const detail = await paymentVerifyLeadDetail(tx, payment.leadId, settings);
          return { payment: updatedPayment, ...detail };
        }

        if (payment.kind === PaymentKind.ADVANCE) {
          if (!payment.lead.convertedAt) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Lead must be converted to a client before advance payment can be verified."
            );
          }
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
          const existingProject = await tx.project.findUnique({ where: { leadId: payment.leadId } });
          if (!existingProject) {
            await tx.project.create({
              data: {
                leadId: payment.leadId,
                title: `${lead.clientName} website`
              }
            });
          }
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
          const repIdAdv = lead.assignedToUserId ?? lead.createdByUserId;
          await notifyRepOfAdminDecision(tx, {
            leadId: payment.leadId,
            repUserId: repIdAdv,
            kind: PortalNotificationKind.ADMIN_VERIFIED,
            stageKey: "advance_verify",
            message: `${lead.clientName}: advance payment verified.`
          });
          const detailAdv = await paymentVerifyLeadDetail(tx, payment.leadId, settings);
          return { payment: updatedPayment, ...detailAdv };
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
        const repIdFin = lead.assignedToUserId ?? lead.createdByUserId;
        await notifyRepOfAdminDecision(tx, {
          leadId: payment.leadId,
          repUserId: repIdFin,
          kind: PortalNotificationKind.ADMIN_VERIFIED,
          stageKey: "final_verify",
          message: `${lead.clientName}: due payment verified.`
        });
        const detailFin = await paymentVerifyLeadDetail(tx, payment.leadId, settings);
        return { payment: updatedPayment, ...detailFin };
      });

      return reply.send(result);
    }
  );
}
