import type { FastifyInstance } from "fastify";
import { ActivityAction, LeadStatus, Prisma, UserRole } from "@prisma/client";
import { clampPage } from "../lib/pagination.js";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings } from "../services/settings.js";
import {
  assertCommissionPayable,
  commissionIntegrityIssues,
  expectedCommissionAmountCents
} from "../services/commissionRules.js";
import {
  healLeadToCommissionPaidIfNeeded,
  loadLeadDetailForAdmin,
  promoteLeadToDeployedIfEligible,
  syncUnpaidCommissionAmount
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
      const [siteLive, paid] = await Promise.all([
        app.prisma.commission.count({
          where: {
            ...where,
            lead: { project: { deploymentVerifiedAt: { not: null } } }
          }
        }),
        app.prisma.commission.count({ where: { ...where, isPaid: true } })
      ]);
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const settings = await getPortalSettings(app.prisma);
      const rows = await app.prisma.commission.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              clientName: true,
              status: true,
              agreedTotalCents: true,
              project: { select: { deploymentVerifiedAt: true } }
            }
          },
          rep: { select: { id: true, displayName: true } }
        }
      });

      const items = [];
      for (const row of rows) {
        let current = row;
        let issues = commissionIntegrityIssues(current.lead, current, settings);
        const expected = expectedCommissionAmountCents(current.lead, settings);
        const amountMismatch = issues.some((msg) =>
          msg.includes("does not match")
        );
        if (!current.isPaid && amountMismatch) {
          const healedAmount = await app.prisma.$transaction((tx) =>
            syncUnpaidCommissionAmount(tx, current.leadId, settings)
          );
          if (healedAmount != null && healedAmount !== current.amountCents) {
            current = { ...current, amountCents: healedAmount };
            issues = commissionIntegrityIssues(current.lead, current, settings);
          }
        }
        items.push({
          ...current,
          expectedAmountCents: expectedCommissionAmountCents(current.lead, settings),
          integrityIssues: issues
        });
      }

      return reply.send({
        items,
        total,
        page,
        pageSize: query.pageSize,
        summary: {
          total,
          siteLive,
          calculated: total,
          paid
        }
      });
    }
  );

  app.patch(
    "/api/commissions/:id",
    { preHandler: [requireUser] },
    async (request) => {
      requireAdmin(request);
      patchCommissionBodySchema.parse(request.body);
      throw new HttpError(
        403,
        "COMMISSION_AMOUNT_LOCKED",
        "Commission amount is calculated automatically from the agreed project total and cannot be edited."
      );
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
            await healLeadToCommissionPaidIfNeeded(tx, commission.leadId);
            const healed = await tx.commission.findUniqueOrThrow({ where: { id } });
            const detail = await loadLeadDetailForAdmin(tx, commission.leadId);
            return { commission: healed, ...detail };
          }

          const settings = await getPortalSettings(tx);
          await syncUnpaidCommissionAmount(tx, commission.leadId, settings);

          const refreshedCommission = await tx.commission.findUniqueOrThrow({
            where: { id },
            include: { lead: true }
          });
          assertCommissionPayable(
            refreshedCommission.lead,
            refreshedCommission,
            settings
          );

          const project = commission.lead.project;
          await promoteLeadToDeployedIfEligible(tx, commission.leadId, {
            deploymentVerifiedAt: project?.deploymentVerifiedAt
          });

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
