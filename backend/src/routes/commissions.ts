import type { FastifyInstance } from "fastify";
import {
  ActivityAction,
  CommissionModel,
  LeadStatus,
  Prisma,
  UserRole
} from "@prisma/client";
import { clampPage } from "../lib/pagination.js";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings } from "../services/settings.js";
import {
  assertCommissionPayableForModel,
  commissionIntegrityIssuesForModel,
  computePerformanceBonusCents,
  expectedCommissionAmountCentsForModel,
  repQualifiesForPerformanceBonus,
  resolveEffectiveCommissionRowModel
} from "../services/commissionRules.js";
import {
  buildMilestoneProgress,
  getDeployedOrdinalForLead,
  getRepCommissionModel,
  isMilestonePayoutReady,
  MODEL_B_MILESTONE_AMOUNT_CENTS,
  MODEL_B_PER_DEAL_AFTER_CENTS
} from "../services/commissionModel.js";
import { getCommissionRepUserId } from "../services/commissionRep.js";
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

      let viewerModel: CommissionModel | null = null;
      if (user.role === UserRole.SALES_REP) {
        viewerModel = await getRepCommissionModel(app.prisma, user.id);
      }

      const modelBRepAmountFilter =
        user.role === UserRole.SALES_REP && viewerModel === CommissionModel.MODEL_B
          ? {
              amountCents: {
                in: [MODEL_B_MILESTONE_AMOUNT_CENTS, MODEL_B_PER_DEAL_AFTER_CENTS]
              }
            }
          : {};

      const where =
        user.role === UserRole.ADMIN
          ? {
              ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {})
            }
          : {
              repUserId: user.id,
              ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {}),
              ...modelBRepAmountFilter
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
          rep: {
            select: { id: true, displayName: true, commissionModel: true }
          }
        }
      });

      const items = [];
      for (const row of rows) {
        let current = row;
        const rowModel =
          row.rep.commissionModel ??
          (await getRepCommissionModel(app.prisma, row.repUserId));
        const deployedOrdinal = await getDeployedOrdinalForLead(
          app.prisma,
          row.repUserId,
          current.leadId
        );
        const effectiveRowModel = resolveEffectiveCommissionRowModel(
          rowModel,
          current.lead,
          current,
          settings,
          deployedOrdinal
        );
        let issues = commissionIntegrityIssuesForModel(
          current.lead,
          current,
          settings,
          effectiveRowModel,
          deployedOrdinal
        );
        const expected = expectedCommissionAmountCentsForModel(
          current.lead,
          settings,
          effectiveRowModel,
          deployedOrdinal
        );
        const amountMismatch = issues.some((msg) =>
          msg.includes("does not match") || msg.includes("Payout amount")
        );
        if (!current.isPaid && amountMismatch) {
          const healedAmount = await app.prisma.$transaction((tx) =>
            syncUnpaidCommissionAmount(tx, current.leadId, settings)
          );
          if (healedAmount != null && healedAmount !== current.amountCents) {
            current = { ...current, amountCents: healedAmount };
            issues = commissionIntegrityIssuesForModel(
              current.lead,
              current,
              settings,
              effectiveRowModel,
              deployedOrdinal
            );
          }
        }
        const item: Record<string, unknown> = {
          ...current,
          integrityIssues: issues,
          rowCommissionModel: effectiveRowModel
        };
        if (viewerModel !== CommissionModel.MODEL_B && user.role !== UserRole.SALES_REP) {
          item.expectedAmountCents = expected;
        } else if (viewerModel === CommissionModel.MODEL_A) {
          item.expectedAmountCents = expected;
        }
        if (viewerModel === CommissionModel.MODEL_B) {
          delete item.expectedAmountCents;
        }
        items.push(item);
      }

      const summary: Record<string, unknown> = {
        total,
        siteLive,
        calculated: total,
        paid
      };

      if (viewerModel === CommissionModel.MODEL_B) {
        summary.milestone = await buildMilestoneProgress(app.prisma, user.id);
      }

      return reply.send({
        items,
        total,
        page,
        pageSize: query.pageSize,
        summary
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
    "/api/leads/:leadId/commission/milestone-payout",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { leadId } = request.params as { leadId: string };

      const outcome = await app.prisma.$transaction(
        async (tx) => {
          const lead = await tx.lead.findUnique({
            where: { id: leadId },
            include: { commission: true, project: true, payments: true }
          });
          if (!lead) {
            throw new HttpError(404, "NOT_FOUND", "Lead not found.");
          }
          const repId = getCommissionRepUserId(lead);
          const model = await getRepCommissionModel(tx, repId);
          if (model !== CommissionModel.MODEL_B) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Milestone payout applies only to Model B sales reps."
            );
          }
          if (lead.commission) {
            throw new HttpError(400, "ALREADY_EXISTS", "Commission already exists for this lead.");
          }
          if (!lead.project?.deploymentVerifiedAt) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Verify deployment before paying the milestone."
            );
          }
          const ready = await isMilestonePayoutReady(tx, repId, leadId);
          if (!ready) {
            throw new HttpError(
              400,
              "MILESTONE_NOT_READY",
              "This lead is not the 5th site-live deal for milestone payout."
            );
          }

          await promoteLeadToDeployedIfEligible(tx, leadId, {
            deploymentVerifiedAt: lead.project.deploymentVerifiedAt
          });

          const refreshed = await tx.lead.findUniqueOrThrow({ where: { id: leadId } });
          if (refreshed.status !== LeadStatus.DEPLOYED) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Lead must be deployed with verified final payment before milestone payout."
            );
          }

          const now = new Date();
          const commission = await tx.commission.create({
            data: {
              leadId,
              repUserId: repId,
              amountCents: MODEL_B_MILESTONE_AMOUNT_CENTS,
              bonusCents: 0,
              isPaid: true,
              paidAt: now,
              paidByAdminId: admin.id
            }
          });

          const leadClaim = await tx.lead.updateMany({
            where: { id: leadId, status: LeadStatus.DEPLOYED },
            data: { status: LeadStatus.COMMISSION_PAID }
          });
          if (leadClaim.count === 0) {
            throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead status changed concurrently.");
          }

          await logActivity({
            prisma: app.prisma,
            tx,
            userId: admin.id,
            action: ActivityAction.COMMISSION_PAID,
            entityType: "Commission",
            entityId: commission.id,
            after: {
              milestonePayout: true,
              amountCents: MODEL_B_MILESTONE_AMOUNT_CENTS,
              leadStatus: LeadStatus.COMMISSION_PAID
            },
            request
          });

          const detail = await loadLeadDetailForAdmin(tx, leadId);
          return { commission, ...detail };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      return reply.send(outcome);
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
          const model = await getRepCommissionModel(tx, commission.repUserId);
          const deployedOrdinal = await getDeployedOrdinalForLead(
            tx,
            commission.repUserId,
            commission.leadId
          );
          await syncUnpaidCommissionAmount(tx, commission.leadId, settings);

          const refreshedCommission = await tx.commission.findUniqueOrThrow({
            where: { id },
            include: { lead: true }
          });
          const rowModel = resolveEffectiveCommissionRowModel(
            model,
            refreshedCommission.lead,
            refreshedCommission,
            settings,
            deployedOrdinal
          );
          assertCommissionPayableForModel(
            refreshedCommission.lead,
            refreshedCommission,
            settings,
            rowModel,
            deployedOrdinal
          );

          const project = commission.lead.project;
          await promoteLeadToDeployedIfEligible(tx, commission.leadId, {
            deploymentVerifiedAt: project?.deploymentVerifiedAt
          });

          const paidCount = await tx.commission.count({
            where: { repUserId: commission.repUserId, isPaid: true }
          });
          const bonusCents =
            rowModel === CommissionModel.MODEL_A &&
            repQualifiesForPerformanceBonus(paidCount, settings)
              ? computePerformanceBonusCents(refreshedCommission.lead, settings)
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
