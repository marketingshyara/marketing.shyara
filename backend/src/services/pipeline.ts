import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  type Lead,
  type LeadPayment,
  type Project,
  type UserRole
} from "@prisma/client";
import type { PortalSettingsValues } from "../validators/schemas.js";

export type PipelineStageKey =
  | "lead_capture"
  | "convert_deal"
  | "advance_verify"
  | "whatsapp_group"
  | "build_demo"
  | "demo_finalized"
  | "accounts_ready"
  | "final_payment"
  | "final_verify"
  | "repo_transfer"
  | "deployment_submit"
  | "deployment_verify"
  | "commission";

export type StageUiState = "locked" | "actionable" | "pending_admin" | "verified";

export type PipelineStageView = {
  key: PipelineStageKey;
  title: string;
  repActor: boolean;
  adminActor: boolean;
  state: StageUiState;
  hint?: string;
};

type LeadWithRelations = Lead & {
  payments?: LeadPayment[];
  project?: Project | null;
};

function hasVerifiedPayment(lead: LeadWithRelations, kind: PaymentKind): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === kind && p.verificationStatus === PaymentVerificationStatus.VERIFIED
    ) ?? false
  );
}

function hasPendingPayment(lead: LeadWithRelations, kind: PaymentKind): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === kind && p.verificationStatus === PaymentVerificationStatus.PENDING
    ) ?? false
  );
}

export function isLeadOnlyRecord(lead: Lead): boolean {
  return lead.convertedAt == null;
}

export function getPipelineStages(
  lead: LeadWithRelations,
  _settings: PortalSettingsValues,
  role: UserRole
): PipelineStageView[] {
  const isAdmin = role === "ADMIN";
  const converted = lead.convertedAt != null;
  const advanceVerified = hasVerifiedPayment(lead, PaymentKind.ADVANCE);
  const advancePending = hasPendingPayment(lead, PaymentKind.ADVANCE);
  const finalVerified = hasVerifiedPayment(lead, PaymentKind.FINAL);
  const finalPending = hasPendingPayment(lead, PaymentKind.FINAL);
  const proj = lead.project;
  const whatsappVerified = lead.whatsappVerifiedAt != null;
  const previewReady = Boolean(proj?.previewUrl);
  const demoDone = lead.demoFinalizedAt != null;
  const accountsRep = lead.accountsReadyAt != null;
  const accountsVerified = lead.accountsReadyVerifiedAt != null;
  const repoDone = lead.repoTransferVerifiedAt != null;
  const deploySubmitted = Boolean(proj?.deploymentSubmittedAt);
  const deployVerified = Boolean(proj?.deploymentVerifiedAt);
  const commissionPaid = lead.status === LeadStatus.COMMISSION_PAID;

  const idleBuild =
    whatsappVerified && !previewReady && !demoDone && !finalVerified && !commissionPaid;

  const stages: PipelineStageView[] = [
    {
      key: "lead_capture",
      title: "Lead details",
      repActor: true,
      adminActor: false,
      state: lead.clientName.trim() ? "verified" : "actionable"
    },
    {
      key: "convert_deal",
      title: "Deal & advance payment",
      repActor: true,
      adminActor: false,
      state: !converted
        ? "actionable"
        : advancePending
          ? "pending_admin"
          : advanceVerified
            ? "verified"
            : "actionable"
    },
    {
      key: "advance_verify",
      title: "Advance verified (accounts)",
      repActor: false,
      adminActor: true,
      state: !converted
        ? "locked"
        : advanceVerified
          ? "verified"
          : advancePending
            ? isAdmin
              ? "actionable"
              : "pending_admin"
            : "locked"
    },
    {
      key: "whatsapp_group",
      title: "WhatsApp group link",
      repActor: true,
      adminActor: true,
      state: !advanceVerified
        ? "locked"
        : whatsappVerified
          ? "verified"
          : lead.whatsappGroupLink
            ? isAdmin
              ? "actionable"
              : "pending_admin"
            : "actionable"
    },
    {
      key: "build_demo",
      title: "Website build & demo link",
      repActor: false,
      adminActor: true,
      state: !whatsappVerified
        ? "locked"
        : previewReady
          ? "verified"
          : idleBuild
            ? "pending_admin"
            : isAdmin
              ? "actionable"
              : "pending_admin",
      hint: idleBuild && !isAdmin ? "Waiting on technical team" : undefined
    },
    {
      key: "demo_finalized",
      title: "Demo approved by client",
      repActor: true,
      adminActor: false,
      state: !previewReady ? "locked" : demoDone ? "verified" : "actionable"
    },
    {
      key: "accounts_ready",
      title: "GitHub & deploy accounts ready",
      repActor: true,
      adminActor: true,
      state: !demoDone
        ? "locked"
        : accountsVerified
          ? "verified"
          : accountsRep
            ? isAdmin
              ? "actionable"
              : "pending_admin"
            : "actionable"
    },
    {
      key: "final_payment",
      title: "Due payment (50%)",
      repActor: true,
      adminActor: false,
      state: !accountsVerified
        ? "locked"
        : finalVerified
          ? "verified"
          : finalPending
            ? "pending_admin"
            : "actionable"
    },
    {
      key: "final_verify",
      title: "Due payment verified",
      repActor: false,
      adminActor: true,
      state: !accountsVerified
        ? "locked"
        : finalVerified
          ? "verified"
          : finalPending
            ? isAdmin
              ? "actionable"
              : "pending_admin"
            : "locked"
    },
    {
      key: "repo_transfer",
      title: "Repository transferred",
      repActor: false,
      adminActor: true,
      state: !finalVerified
        ? "locked"
        : repoDone
          ? "verified"
          : isAdmin
            ? "actionable"
            : "pending_admin"
    },
    {
      key: "deployment_submit",
      title: "Client site deployed",
      repActor: true,
      adminActor: false,
      state: !repoDone
        ? "locked"
        : deployVerified
          ? "verified"
          : deploySubmitted
            ? "pending_admin"
            : "actionable"
    },
    {
      key: "deployment_verify",
      title: "Deployment verified",
      repActor: false,
      adminActor: true,
      state: !deploySubmitted
        ? "locked"
        : deployVerified
          ? "verified"
          : isAdmin
            ? "actionable"
            : "pending_admin"
    },
    {
      key: "commission",
      title: "Commission paid",
      repActor: false,
      adminActor: true,
      state: commissionPaid
        ? "verified"
        : deployVerified
          ? isAdmin
            ? "actionable"
            : "pending_admin"
          : "locked",
      hint: deployVerified && !commissionPaid ? "Paid within 3–5 business days after admin marks complete" : undefined
    }
  ];

  return stages;
}

export function summarizePipelineStages(stages: PipelineStageView[]): {
  currentStageKey: PipelineStageKey;
  currentStageTitle: string;
  pendingAdmin: boolean;
} {
  const pendingAdmin = stages.some(
    (s) => s.state === "pending_admin" || (s.adminActor && s.state === "actionable")
  );
  const current =
    stages.find((s) => s.state === "pending_admin") ??
    stages.find((s) => s.state === "actionable") ??
    [...stages].reverse().find((s) => s.state === "verified") ??
    stages[0]!;
  return {
    currentStageKey: current.key,
    currentStageTitle: current.title,
    pendingAdmin
  };
}

export function assertMinAgreedTotal(agreedTotalCents: number, settings: PortalSettingsValues): void {
  if (agreedTotalCents < settings.minAgreedTotalCents) {
    throw new Error(
      `Agreed total must be at least ₹${(settings.minAgreedTotalCents / 100).toFixed(0)}.`
    );
  }
}
