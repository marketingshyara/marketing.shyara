import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  UserRole,
  type Prisma,
  type PrismaClient
} from "@prisma/client";
import {
  findMilestoneReadyLead,
  MODEL_B_MILESTONE_AMOUNT_CENTS
} from "./commissionModel.js";
import { getCommissionRepUserId } from "./commissionRep.js";

export type PendingActionType =
  | "PAYMENT"
  | "CLIENT_DETAILS"
  | "WHATSAPP"
  | "DEMO_FINALIZED"
  | "ACCOUNTS"
  | "BUILD_DEMO"
  | "REPO_TRANSFER"
  | "DEPLOYMENT"
  | "COMMISSION"
  | "MILESTONE_PAYOUT";

export type PendingActionItem = {
  type: PendingActionType;
  leadId: string;
  repId: string | null;
  clientName: string;
  stageKey: string;
  submittedAt: string;
  summary: string;
  paymentId?: string;
  paymentKind?: PaymentKind;
};

function baseLeadWhere(): Prisma.LeadWhereInput {
  return { status: { not: LeadStatus.COMMISSION_PAID } };
}

export async function listPendingActions(
  prisma: PrismaClient,
  opts: { type?: PendingActionType; page: number; pageSize: number }
): Promise<{ items: PendingActionItem[]; total: number }> {
  const items: PendingActionItem[] = [];

  const leads = await prisma.lead.findMany({
    where: baseLeadWhere(),
    include: {
      payments: true,
      project: true,
      commission: true
    },
    orderBy: { updatedAt: "desc" },
    take: 500
  });

  for (const lead of leads) {
    const repId = lead.assignedToUserId ?? lead.createdByUserId;

    for (const p of lead.payments) {
      if (p.verificationStatus === PaymentVerificationStatus.PENDING) {
        items.push({
          type: "PAYMENT",
          leadId: lead.id,
          repId,
          clientName: lead.clientName,
          stageKey: p.kind === PaymentKind.ADVANCE ? "advance_verify" : "final_verify",
          submittedAt: p.markedAt.toISOString(),
          summary: `${p.kind} payment ₹${(p.amountCents / 100).toFixed(0)} pending`,
          paymentId: p.id,
          paymentKind: p.kind
        });
      }
    }

    if (
      lead.convertedAt &&
      lead.clientDetailsSubmittedAt &&
      !lead.clientDetailsVerifiedAt
    ) {
      items.push({
        type: "CLIENT_DETAILS",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "lead_capture",
        submittedAt: lead.clientDetailsSubmittedAt.toISOString(),
        summary: "Updated client details to verify"
      });
    }

    if (
      lead.convertedAt &&
      lead.payments.some(
        (x) => x.kind === PaymentKind.ADVANCE && x.verificationStatus === PaymentVerificationStatus.VERIFIED
      ) &&
      lead.whatsappGroupLink &&
      !lead.whatsappVerifiedAt
    ) {
      items.push({
        type: "WHATSAPP",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "whatsapp_group",
        submittedAt: (lead.updatedAt ?? lead.createdAt).toISOString(),
        summary: "WhatsApp group link to verify"
      });
    }

    if (lead.demoFinalizedAt && !lead.demoFinalizedVerifiedAt) {
      items.push({
        type: "DEMO_FINALIZED",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "demo_finalized",
        submittedAt: lead.demoFinalizedAt.toISOString(),
        summary: "Client demo approval to verify"
      });
    }

    if (lead.accountsReadyAt && !lead.accountsReadyVerifiedAt) {
      items.push({
        type: "ACCOUNTS",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "accounts_ready",
        submittedAt: lead.accountsReadyAt.toISOString(),
        summary: "Accounts ready to verify"
      });
    }

    if (
      lead.whatsappVerifiedAt &&
      !lead.project?.previewUrl &&
      !lead.demoFinalizedVerifiedAt
    ) {
      items.push({
        type: "BUILD_DEMO",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "build_demo",
        submittedAt: (lead.whatsappVerifiedAt ?? lead.updatedAt).toISOString(),
        summary: "Set preview URL and mark demo ready"
      });
    }

    if (
      lead.status === LeadStatus.FINAL_PAID &&
      !lead.repoTransferVerifiedAt &&
      lead.payments.some(
        (x) => x.kind === PaymentKind.FINAL && x.verificationStatus === PaymentVerificationStatus.VERIFIED
      )
    ) {
      items.push({
        type: "REPO_TRANSFER",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "repo_transfer",
        submittedAt: lead.updatedAt.toISOString(),
        summary: "Repository transfer to verify"
      });
    }

    if (lead.project?.deploymentSubmittedAt && !lead.project.deploymentVerifiedAt) {
      items.push({
        type: "DEPLOYMENT",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "deployment_verify",
        submittedAt: lead.project.deploymentSubmittedAt.toISOString(),
        summary: "Deployment URL to verify"
      });
    }

    if (lead.project?.deploymentVerifiedAt && lead.commission && !lead.commission.isPaid) {
      items.push({
        type: "COMMISSION",
        leadId: lead.id,
        repId,
        clientName: lead.clientName,
        stageKey: "commission",
        submittedAt: lead.commission.createdAt.toISOString(),
        summary: "Commission payout pending"
      });
    }
  }

  const modelBReps = await prisma.user.findMany({
    where: {
      role: UserRole.SALES_REP,
      commissionModel: "MODEL_B",
      isActive: true,
      archivedAt: null
    },
    select: { id: true, displayName: true }
  });
  for (const rep of modelBReps) {
    const milestoneLeadId = await findMilestoneReadyLead(prisma, rep.id);
    if (!milestoneLeadId) continue;
    const lead = await prisma.lead.findUnique({
      where: { id: milestoneLeadId },
      select: { clientName: true, project: { select: { deploymentVerifiedAt: true } } }
    });
    if (!lead?.project?.deploymentVerifiedAt) continue;
    items.push({
      type: "MILESTONE_PAYOUT",
      leadId: milestoneLeadId,
      repId: rep.id,
      clientName: lead.clientName,
      stageKey: "commission",
      submittedAt: lead.project.deploymentVerifiedAt.toISOString(),
      summary: `${rep.displayName ?? "Sales rep"} reached 5 site-live deals — pay ₹${MODEL_B_MILESTONE_AMOUNT_CENTS / 100} milestone`
    });
  }

  const filtered = opts.type ? items.filter((i) => i.type === opts.type) : items;
  filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const total = filtered.length;
  const start = (opts.page - 1) * opts.pageSize;
  const pageItems = filtered.slice(start, start + opts.pageSize);
  return { items: pageItems, total };
}

export async function countPendingActions(prisma: PrismaClient): Promise<number> {
  const { total } = await listPendingActions(prisma, { page: 1, pageSize: 1_000_000 });
  return total;
}
