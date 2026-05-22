import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  UserRole,
  type Lead,
  type LeadPayment,
  type Project
} from "@prisma/client";
import type { PortalSettingsValues } from "../validators/schemas.js";
import { getRequiredLeadStatusForPaymentKind } from "./settings.js";
import {
  declineNoteForPipelineEntry,
  latestRejectedPaymentAdminNote,
  parseStageDeclineNotes,
  pipelineStageToDeclineKey
} from "./stageDeclineNotes.js";

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
  /** Shown when state is locked — why the step cannot be acted on yet. */
  blockedReason?: string;
  /** Admin decline feedback when this step needs resubmit; null = declined with no written note. */
  declineNote?: string | null;
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

const POST_PREVIEW_STATUSES: LeadStatus[] = [
  LeadStatus.PREVIEW_SENT,
  LeadStatus.FINAL_PAID,
  LeadStatus.DEPLOYED,
  LeadStatus.COMMISSION_PAID
];

function isPreviewMarkedReady(lead: LeadWithRelations): boolean {
  return POST_PREVIEW_STATUSES.includes(lead.status);
}

type PipelineLockContext = {
  converted: boolean;
  advanceVerified: boolean;
  advancePending: boolean;
  whatsappVerified: boolean;
  previewMarkedReady: boolean;
  demoVerified: boolean;
  accountsVerified: boolean;
  finalVerified: boolean;
  finalPending: boolean;
  repoDone: boolean;
  deploySubmitted: boolean;
  deployVerified: boolean;
  advancePaymentStatus: LeadStatus;
  finalPaymentStatus: LeadStatus;
  canConvert: boolean;
  canRecordFinalPayment: boolean;
};

function defaultLockedReason(key: PipelineStageKey, ctx: PipelineLockContext): string {
  switch (key) {
    case "advance_verify":
      return ctx.converted
        ? "Waiting for the rep to submit advance payment."
        : "Convert the deal and record advance payment first.";
    case "whatsapp_group":
      return "Verify the advance payment before the WhatsApp group step.";
    case "demo_finalized":
      return "Admin must mark the demo ready before the rep confirms client approval.";
    case "accounts_ready":
      return "Admin must verify demo approval before accounts can be marked ready.";
    case "final_payment":
      if (!ctx.accountsVerified) {
        return "Complete and verify accounts ready before recording due payment.";
      }
      return `Record due payment when lead status is ${ctx.finalPaymentStatus}.`;
    case "final_verify":
      if (!ctx.accountsVerified) {
        return "Accounts must be ready before you can verify due payment.";
      }
      return "Rep must record due payment before you can verify it.";
    case "repo_transfer":
      return "Verify the due payment before confirming repository transfer.";
    case "deployment_submit":
      return "Admin must verify repository transfer before the rep submits the live URL.";
    case "deployment_verify":
      return "Rep must submit the live URL before you can verify deployment.";
    case "commission":
      return "Verify deployment before marking commission paid.";
    case "convert_deal":
      return `Convert is available when lead status is ${ctx.advancePaymentStatus}.`;
    default:
      return "Complete earlier steps first.";
  }
}

function enrichLockedReasons(
  stages: PipelineStageView[],
  ctx: PipelineLockContext
): PipelineStageView[] {
  return stages.map((s) =>
    s.state === "locked" && !s.blockedReason
      ? { ...s, blockedReason: defaultLockedReason(s.key, ctx) }
      : s
  );
}

function stageShowsDeclineFeedback(
  stage: PipelineStageView,
  isAdmin: boolean,
  options?: { paymentDeclineOnVerifyStage?: boolean }
): boolean {
  if (stage.state === "actionable") return true;
  if (isAdmin && stage.state === "pending_admin") return true;
  if (isAdmin && options?.paymentDeclineOnVerifyStage) return true;
  return false;
}

function attachDeclineNotes(
  stages: PipelineStageView[],
  lead: LeadWithRelations,
  isAdmin: boolean
): PipelineStageView[] {
  const declineMap = parseStageDeclineNotes(lead);
  const advancePayNote = latestRejectedPaymentAdminNote(lead, "ADVANCE");
  const finalPayNote = latestRejectedPaymentAdminNote(lead, "FINAL");
  const advancePending = hasPendingPayment(lead, PaymentKind.ADVANCE);
  const finalPending = hasPendingPayment(lead, PaymentKind.FINAL);

  const advancePaymentDeclined =
    advancePayNote !== undefined &&
    !advancePending &&
    !hasVerifiedPayment(lead, PaymentKind.ADVANCE);
  const finalPaymentDeclined =
    finalPayNote !== undefined &&
    !finalPending &&
    !hasVerifiedPayment(lead, PaymentKind.FINAL);

  return stages.map((stage) => {
    let declineNote: string | null | undefined;

    const declineKey = pipelineStageToDeclineKey(stage.key);
    if (declineKey) {
      declineNote = declineNoteForPipelineEntry(declineMap[declineKey]);
    }

    if (
      (stage.key === "convert_deal" || stage.key === "advance_verify") &&
      advancePaymentDeclined
    ) {
      declineNote = advancePayNote;
    }
    if (
      (stage.key === "final_payment" || stage.key === "final_verify") &&
      finalPaymentDeclined
    ) {
      declineNote = finalPayNote;
    }

    if (declineNote === undefined) {
      return stage;
    }

    const paymentDeclineOnVerifyStage =
      (stage.key === "advance_verify" && advancePaymentDeclined) ||
      (stage.key === "final_verify" && finalPaymentDeclined);

    if (!stageShowsDeclineFeedback(stage, isAdmin, { paymentDeclineOnVerifyStage })) {
      return stage;
    }
    return { ...stage, declineNote };
  });
}

export function getPipelineStages(
  lead: LeadWithRelations,
  settings: PortalSettingsValues,
  role: UserRole
): PipelineStageView[] {
  const isAdmin = role === UserRole.ADMIN;
  const converted = lead.convertedAt != null;
  const advanceVerified = hasVerifiedPayment(lead, PaymentKind.ADVANCE);
  const advancePending = hasPendingPayment(lead, PaymentKind.ADVANCE);
  const finalVerified = hasVerifiedPayment(lead, PaymentKind.FINAL);
  const finalPending = hasPendingPayment(lead, PaymentKind.FINAL);
  const proj = lead.project;
  const whatsappVerified = lead.whatsappVerifiedAt != null;
  const previewUrlSaved = Boolean(proj?.previewUrl);
  const previewMarkedReady = isPreviewMarkedReady(lead);
  const advancePaymentStatus = getRequiredLeadStatusForPaymentKind(settings, "ADVANCE");
  const finalPaymentStatus = getRequiredLeadStatusForPaymentKind(settings, "FINAL");
  const terminal = settings.terminalNoMutationStatuses.includes(lead.status);
  const demoRepSubmitted = lead.demoFinalizedAt != null;
  const demoVerified = lead.demoFinalizedVerifiedAt != null;
  const accountsRep = lead.accountsReadyAt != null;
  const accountsVerified = lead.accountsReadyVerifiedAt != null;
  const repoDone = lead.repoTransferVerifiedAt != null;
  const deploySubmitted = Boolean(proj?.deploymentSubmittedAt);
  const deployVerified = Boolean(proj?.deploymentVerifiedAt);
  const commissionPaid = lead.status === LeadStatus.COMMISSION_PAID;

  const idleBuild =
    whatsappVerified && !previewMarkedReady && !demoVerified && !finalVerified && !commissionPaid;

  const canConvert =
    !converted &&
    !terminal &&
    lead.status === advancePaymentStatus &&
    !advancePending &&
    !advanceVerified;
  const canRecordFinalPayment =
    accountsVerified &&
    !finalVerified &&
    !finalPending &&
    !terminal &&
    lead.status === finalPaymentStatus;

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
      state: advanceVerified
        ? "verified"
        : advancePending
          ? "pending_admin"
          : canConvert
            ? "actionable"
            : "locked",
      blockedReason:
        !converted && !canConvert && !advancePending
          ? `Convert is available when lead status is ${advancePaymentStatus}.`
          : undefined
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
        : previewMarkedReady
          ? "verified"
          : isAdmin
            ? "actionable"
            : "pending_admin",
      hint: idleBuild && !isAdmin ? "Waiting on technical team" : undefined,
      blockedReason:
        !whatsappVerified
          ? "Verify the WhatsApp group before the demo link step."
          : isAdmin && previewUrlSaved && !previewMarkedReady
            ? "Save the preview URL, then mark demo ready."
            : undefined
    },
    {
      key: "demo_finalized",
      title: "Demo approved by client",
      repActor: true,
      adminActor: true,
      state: !previewMarkedReady
        ? "locked"
        : demoVerified
          ? "verified"
          : demoRepSubmitted
            ? isAdmin
              ? "actionable"
              : "pending_admin"
            : "actionable"
    },
    {
      key: "accounts_ready",
      title: "GitHub & deploy accounts ready",
      repActor: true,
      adminActor: true,
      state: !demoVerified
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
            : canRecordFinalPayment
              ? "actionable"
              : "locked",
      blockedReason:
        accountsVerified && !canRecordFinalPayment && !finalPending && !finalVerified
          ? `Record due payment when lead status is ${finalPaymentStatus}.`
          : undefined
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

  const withDecline = attachDeclineNotes(stages, lead, isAdmin);
  return enrichLockedReasons(withDecline, {
    converted,
    advanceVerified,
    advancePending,
    whatsappVerified,
    previewMarkedReady,
    demoVerified,
    accountsVerified,
    finalVerified,
    finalPending,
    repoDone,
    deploySubmitted,
    deployVerified,
    advancePaymentStatus,
    finalPaymentStatus,
    canConvert,
    canRecordFinalPayment
  });
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
