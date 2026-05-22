import type { FastifyInstance } from "fastify";
import { ActivityAction, LeadStatus, Prisma, UserRole } from "@prisma/client";
import { clampPage } from "../lib/pagination.js";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings } from "../services/settings.js";
import {
  loadLeadDetailForAdmin,
  promoteLeadToDeployedIfEligible
} from "../services/commissionPayout.js";
import { commissionsListQuerySchema, patchCommissionBodySchema } from "../validators/schemas.js";

export async function registerCommissionRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/commissions",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const query = commissionsListQuerySchema.parse(request.query);

      const where =
        user.role === UserRole.ADMIN
          ? {
              ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {})
            }
          : {
              repUserId: user.id,
              ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {})
            };

      const total = await app.prisma.commission.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.commission.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              clientName: true,
              status: true
            }
          }
        }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );

  app.patch(
    "/api/commissions/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { id } = request.params as { id: string };
      const body = patchCommissionBodySchema.parse(request.body);

      const result = await app.prisma.$transaction(async (tx) => {
        const existing = await tx.commission.findUnique({
          where: { id },
          include: { lead: { include: { project: true } } }
        });
        if (!existing) {
          throw new HttpError(404, "NOT_FOUND", "Commission not found.");
        }
        if (existing.isPaid) {
          throw new HttpError(400, "ALREADY_PAID", "Cannot change amount after commission is paid.");
        }
        if (existing.lead.status === LeadStatus.COMMISSION_PAID) {
          throw new HttpError(400, "LEAD_TERMINAL", "Lead is already commission-paid.");
        }

        const claim = await tx.commission.updateMany({
          where: { id, isPaid: false },
          data: { amountCents: body.amountCents }
        });
        if (claim.count === 0) {
          throw new HttpError(400, "ALREADY_PAID", "Cannot change amount after commission is paid.");
        }
        const updated = await tx.commission.findUniqueOrThrow({ where: { id } });

        await logActivity({
          prisma: app.prisma,
          tx,
          userId: request.currentUser!.id,
          action: ActivityAction.UPDATE,
          entityType: "Commission",
          entityId: id,
          before: { amountCents: existing.amountCents },
          after: { amountCents: updated.amountCents },
          request
        });

        const detail = await loadLeadDetailForAdmin(tx, existing.leadId);
        return { commission: updated, ...detail };
      });

      return reply.send(result);
    }
  );

  app.post(
    "/api/commissions/:id/mark-paid",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { id } = request.params as { id: string };

      const outcome = await app.prisma.$transaction(
        async (tx) => {
          const commission = await tx.commission.findUnique({
            where: { id },
            include: { lead: { include: { project: true } } }
          });
          if (!commission) {
            throw new HttpError(404, "NOT_FOUND", "Commission not found.");
          }
          if (commission.isPaid) {
            throw new HttpError(400, "ALREADY_PAID", "Commission is already marked paid.");
          }

          const project = commission.lead.project;
          await promoteLeadToDeployedIfEligible(tx, commission.leadId, {
            deploymentVerifiedAt: project?.deploymentVerifiedAt
          });

          const settings = await getPortalSettings(tx);
          const paidCount = await tx.commission.count({
            where: { repUserId: commission.repUserId, isPaid: true }
          });
          const bonusCents =
            paidCount >= settings.performanceBonusAfterCompletedSales
              ? settings.performanceBonusAmountCents
              : 0;

          const commClaim = await tx.commission.updateMany({
            where: { id, isPaid: false },
            data: {
              isPaid: true,
              paidAt: new Date(),
              paidByAdminId: admin.id,
              bonusCents
            }
          });
          if (commClaim.count === 0) {
            throw new HttpError(400, "ALREADY_PAID", "Commission is already marked paid.");
          }

          const leadClaim = await tx.lead.updateMany({
            where: { id: commission.leadId, status: LeadStatus.DEPLOYED },
            data: { status: LeadStatus.COMMISSION_PAID }
          });
          if (leadClaim.count === 0) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Verify deployment and due payment before marking commission paid."
            );
          }

          const updatedCommission = await tx.commission.findUniqueOrThrow({ where: { id } });

          await logActivity({
            prisma: app.prisma,
            tx,
            userId: admin.id,
            action: ActivityAction.COMMISSION_PAID,
            entityType: "Commission",
            entityId: id,
            after: { isPaid: true, leadStatus: LeadStatus.COMMISSION_PAID },
            request
          });

          const detail = await loadLeadDetailForAdmin(tx, commission.leadId);
          return { commission: updatedCommission, ...detail };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      return reply.send(outcome);
    }
  );
}
