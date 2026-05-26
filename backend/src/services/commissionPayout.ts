import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  UserRole,
  type Prisma
} from "@prisma/client";
import { getPortalSettings } from "./settings.js";
import { getPipelineStages } from "./pipeline.js";
import { computeCommissionAmountCents } from "./commissionRules.js";
import type { PortalSettingsValues } from "../validators/schemas.js";

const leadDetailInclude = {
  payments: { orderBy: { markedAt: "desc" as const } },
  commission: true,
  project: true,
  websiteTemplate: true
} satisfies Prisma.LeadInclude;

function hasVerifiedFinalPayment(
  lead: { payments: { kind: PaymentKind; verificationStatus: PaymentVerificationStatus }[] }
): boolean {
  return lead.payments.some(
    (p) => p.kind === PaymentKind.FINAL && p.verificationStatus === PaymentVerificationStatus.VERIFIED
  );
}

/** Move FINAL_PAID → DEPLOYED when deployment is verified and due payment is verified. */
export async function promoteLeadToDeployedIfEligible(
  tx: Prisma.TransactionClient,
  leadId: string,
  opts: { deploymentVerifiedAt: Date | null | undefined }
): Promise<void> {
  if (!opts.deploymentVerifiedAt) return;

  const lead = await tx.lead.findUnique({
    where: { id: leadId },
    include: { payments: true }
  });
  if (!lead || lead.status !== LeadStatus.FINAL_PAID) return;
  if (!hasVerifiedFinalPayment(lead)) return;

  await tx.lead.updateMany({
    where: { id: leadId, status: LeadStatus.FINAL_PAID },
    data: { status: LeadStatus.DEPLOYED }
  });
}

/** Align lead status when commission was paid before status-heal shipped (legacy rows). */
export async function healLeadToCommissionPaidIfNeeded(
  tx: Prisma.TransactionClient,
  leadId: string
): Promise<boolean> {
  const lead = await tx.lead.findUnique({
    where: { id: leadId },
    include: { commission: true }
  });
  if (!lead?.commission?.isPaid || lead.status === LeadStatus.COMMISSION_PAID) {
    return false;
  }
  const claim = await tx.lead.updateMany({
    where: {
      id: leadId,
      status: { not: LeadStatus.COMMISSION_PAID },
      commission: { is: { isPaid: true } }
    },
    data: { status: LeadStatus.COMMISSION_PAID }
  });
  return claim.count > 0;
}

export async function loadLeadDetailForAdmin(tx: Prisma.TransactionClient, leadId: string) {
  const settings = await getPortalSettings(tx);
  const lead = await tx.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: leadDetailInclude
  });
  const pipelineStages = getPipelineStages(lead, settings, UserRole.ADMIN);
  return { lead, pipelineStages };
}

/** Recompute unpaid commission from agreed total × rate; returns synced amount or null if none. */
export async function syncUnpaidCommissionAmount(
  tx: Prisma.TransactionClient,
  leadId: string,
  settings: PortalSettingsValues
): Promise<number | null> {
  const commission = await tx.commission.findUnique({
    where: { leadId },
    include: { lead: { include: { payments: true } } }
  });
  if (!commission || commission.isPaid) return null;

  const amountCents = computeCommissionAmountCents(commission.lead, settings);
  if (amountCents !== commission.amountCents) {
    await tx.commission.update({
      where: { leadId },
      data: { amountCents }
    });
  }
  return amountCents;
}
