import {
  CommissionModel,
  LeadStatus,
  UserRole,
  type Lead,
  type Prisma,
  type PrismaClient
} from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import { computeCommissionAmountCents } from "./commissionRules.js";
import type { PortalSettingsValues } from "../validators/schemas.js";
import { getCommissionRepUserId } from "./commissionRep.js";

export const MODEL_B_MILESTONE_TARGET = 5;
export const MODEL_B_MILESTONE_AMOUNT_CENTS = 1_000_000;
export const MODEL_B_PER_DEAL_AFTER_CENTS = 200_000;

export type MilestoneProgress = {
  deployedCount: number;
  milestoneTarget: number;
  paidEarningsCents: number;
  nextPayoutHint: string;
  milestoneReady: boolean;
  milestoneReadyLeadId: string | null;
};

/** Leads attributed to this rep for commission / milestone counting. */
export function repLeadAttributionWhere(repUserId: string): Prisma.LeadWhereInput {
  return {
    OR: [
      { assignedToUserId: repUserId },
      { assignedToUserId: null, createdByUserId: repUserId }
    ]
  };
}

export async function getRepCommissionModel(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<CommissionModel> {
  const user = await prisma.user.findUnique({
    where: { id: repUserId },
    select: { role: true, commissionModel: true }
  });
  if (!user || user.role !== UserRole.SALES_REP) {
    throw new HttpError(400, "INVALID_REP", "Commission model requires an active sales rep.");
  }
  if (!user.commissionModel) {
    throw new HttpError(
      400,
      "COMMISSION_MODEL_REQUIRED",
      "Sales rep is missing a commission model. Ask an admin to set it on the user profile."
    );
  }
  return user.commissionModel;
}

export async function countDeployedDealsForRep(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<number> {
  return prisma.lead.count({
    where: {
      ...repLeadAttributionWhere(repUserId),
      project: { deploymentVerifiedAt: { not: null } }
    }
  });
}

export async function countPaidCommissionsForRep(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<number> {
  return prisma.commission.count({
    where: { repUserId, isPaid: true }
  });
}

/** Sum of paid payout + bonus for rep-facing milestone earnings (preserves legacy Model A payouts). */
export async function sumPaidCommissionEarningsCents(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<number> {
  const rows = await prisma.commission.findMany({
    where: { repUserId, isPaid: true },
    select: { amountCents: true, bonusCents: true }
  });
  return rows.reduce((sum, row) => sum + row.amountCents + row.bonusCents, 0);
}

export function computeModelBEarningsCents(paidCommissionCount: number): number {
  if (paidCommissionCount < MODEL_B_MILESTONE_TARGET) return 0;
  if (paidCommissionCount === MODEL_B_MILESTONE_TARGET) return MODEL_B_MILESTONE_AMOUNT_CENTS;
  return (
    MODEL_B_MILESTONE_AMOUNT_CENTS +
    (paidCommissionCount - MODEL_B_MILESTONE_TARGET) * MODEL_B_PER_DEAL_AFTER_CENTS
  );
}

export function shouldUpsertCommissionOnDeploymentVerify(
  model: CommissionModel,
  deployedCountAfterThisDeal: number
): boolean {
  if (model === CommissionModel.MODEL_A) return true;
  return deployedCountAfterThisDeal > MODEL_B_MILESTONE_TARGET;
}

export function computeModelBCommissionAmountCents(deployedOrdinal: number): number | null {
  if (deployedOrdinal <= MODEL_B_MILESTONE_TARGET) return null;
  return MODEL_B_PER_DEAL_AFTER_CENTS;
}

export function computeCommissionAmountForRep(
  lead: Pick<Lead, "agreedTotalCents">,
  model: CommissionModel,
  settings: PortalSettingsValues,
  deployedOrdinal: number | null
): number {
  if (model === CommissionModel.MODEL_B) {
    if (deployedOrdinal == null || deployedOrdinal <= MODEL_B_MILESTONE_TARGET) {
      throw new HttpError(
        400,
        "MODEL_B_NO_COMMISSION_ROW",
        "Model B does not create a commission row for this deployment ordinal."
      );
    }
    return MODEL_B_PER_DEAL_AFTER_CENTS;
  }
  return computeCommissionAmountCents(lead, settings);
}

export function modelBNextPayoutHint(
  deployedCount: number,
  paidCount: number
): string {
  if (paidCount >= MODEL_B_MILESTONE_TARGET) {
    return `Your next site-live sale earns you ₹${MODEL_B_PER_DEAL_AFTER_CENTS / 100}.`;
  }
  if (deployedCount >= MODEL_B_MILESTONE_TARGET) {
    return "Pay milestone is pending admin approval for your 5th site-live deal.";
  }
  const remaining = MODEL_B_MILESTONE_TARGET - deployedCount;
  return `Complete ${remaining} more site-live deal${remaining === 1 ? "" : "s"} to earn ₹${MODEL_B_MILESTONE_AMOUNT_CENTS / 100}.`;
}

/** Ordered deployed leads for a rep (oldest deployment first). */
export async function listDeployedLeadsForRep(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<{ id: string; deploymentVerifiedAt: Date }[]> {
  const leads = await prisma.lead.findMany({
    where: {
      ...repLeadAttributionWhere(repUserId),
      project: { deploymentVerifiedAt: { not: null } }
    },
    select: {
      id: true,
      project: { select: { deploymentVerifiedAt: true } }
    },
    orderBy: { project: { deploymentVerifiedAt: "asc" } }
  });
  return leads
    .filter((l) => l.project?.deploymentVerifiedAt != null)
    .map((l) => ({
      id: l.id,
      deploymentVerifiedAt: l.project!.deploymentVerifiedAt!
    }));
}

export async function getDeployedOrdinalForLead(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string,
  leadId: string
): Promise<number | null> {
  const deployed = await listDeployedLeadsForRep(prisma, repUserId);
  const idx = deployed.findIndex((l) => l.id === leadId);
  return idx === -1 ? null : idx + 1;
}

export async function findMilestoneReadyLead(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<string | null> {
  const deployed = await listDeployedLeadsForRep(prisma, repUserId);
  if (deployed.length !== MODEL_B_MILESTONE_TARGET) return null;
  const fifth = deployed[MODEL_B_MILESTONE_TARGET - 1];
  const lead = await prisma.lead.findUnique({
    where: { id: fifth.id },
    include: { commission: true, project: true }
  });
  if (!lead?.project?.deploymentVerifiedAt) return null;
  if (lead.commission) return null;
  if (lead.status !== LeadStatus.DEPLOYED && lead.status !== LeadStatus.FINAL_PAID) {
    return null;
  }
  return fifth.id;
}

export async function isMilestonePayoutReady(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string,
  leadId: string
): Promise<boolean> {
  const readyLeadId = await findMilestoneReadyLead(prisma, repUserId);
  return readyLeadId === leadId;
}

export async function buildMilestoneProgress(
  prisma: PrismaClient | Prisma.TransactionClient,
  repUserId: string
): Promise<MilestoneProgress> {
  const [deployedCount, paidEarningsCents, milestoneReadyLeadId] = await Promise.all([
    countDeployedDealsForRep(prisma, repUserId),
    sumPaidCommissionEarningsCents(prisma, repUserId),
    findMilestoneReadyLead(prisma, repUserId)
  ]);
  const paidCount = await countPaidCommissionsForRep(prisma, repUserId);
  return {
    deployedCount,
    milestoneTarget: MODEL_B_MILESTONE_TARGET,
    paidEarningsCents,
    nextPayoutHint: modelBNextPayoutHint(deployedCount, paidCount),
    milestoneReady: milestoneReadyLeadId != null,
    milestoneReadyLeadId
  };
}
