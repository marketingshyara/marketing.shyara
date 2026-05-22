import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  UserRole,
  type Prisma
} from "@prisma/client";
import { getPortalSettings } from "./settings.js";
import { getPipelineStages } from "./pipeline.js";

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

export async function loadLeadDetailForAdmin(tx: Prisma.TransactionClient, leadId: string) {
  const settings = await getPortalSettings(tx);
  const lead = await tx.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: leadDetailInclude
  });
  const pipelineStages = getPipelineStages(lead, settings, UserRole.ADMIN);
  return { lead, pipelineStages };
}
