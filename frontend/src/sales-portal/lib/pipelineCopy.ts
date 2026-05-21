import type {
  LeadPipelineSummary,
  PipelineStageKey,
  PipelineStageView,
  StageUiState
} from "../types";

export type PipelineActorMode = "rep" | "admin";

export type PipelineFocusKind = "action" | "waiting" | "idle";

export type PipelineFocus = {
  kind: PipelineFocusKind;
  stage: PipelineStageView | null;
  stageKey: PipelineStageKey | null;
  headline: string;
  description: string;
  primaryLabel: string | null;
  showViewSubmission: boolean;
};

const SHORT_TITLES: Record<PipelineStageKey, string> = {
  lead_capture: "Lead details",
  convert_deal: "Convert to client",
  advance_verify: "Advance payment",
  whatsapp_group: "WhatsApp group",
  build_demo: "Demo website",
  demo_finalized: "Demo approved",
  accounts_ready: "Accounts ready",
  final_payment: "Due payment",
  final_verify: "Due payment",
  repo_transfer: "Repo transfer",
  deployment_submit: "Live website",
  deployment_verify: "Deployment",
  commission: "Commission"
};

export function stageShortTitle(key: PipelineStageKey, fallbackTitle?: string): string {
  return SHORT_TITLES[key] ?? fallbackTitle ?? key;
}

export function whoActsNext(stage: PipelineStageView, actorMode: PipelineActorMode): string {
  if (stage.state === "actionable") {
    return actorMode === "rep" ? "Your turn" : "Needs your approval";
  }
  if (stage.state === "pending_admin") {
    return actorMode === "rep" ? "Waiting for admin approval" : "Needs your approval";
  }
  if (stage.state === "verified") {
    return "Complete";
  }
  return "Not started yet";
}

function isActionableForActor(stage: PipelineStageView, actorMode: PipelineActorMode): boolean {
  if (stage.state !== "actionable") return false;
  if (actorMode === "rep") return stage.repActor;
  return stage.adminActor;
}

function isWaitingForActor(stage: PipelineStageView, actorMode: PipelineActorMode): boolean {
  if (stage.state === "pending_admin") {
    return actorMode === "rep" ? stage.repActor : stage.adminActor;
  }
  if (actorMode === "admin" && stage.state === "actionable" && stage.adminActor) {
    return true;
  }
  return false;
}

export function listBadgeLabel(
  summary: LeadPipelineSummary,
  stages: PipelineStageView[] | undefined,
  actorMode: PipelineActorMode
): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  const buildWaiting = stages?.find((s) => s.key === "build_demo" && s.hint);
  if (buildWaiting && actorMode === "rep") {
    return { label: "With technical team", variant: "secondary" };
  }
  if (summary.pendingAdmin && actorMode === "rep") {
    return { label: "Waiting on admin", variant: "secondary" };
  }
  if (summary.pendingAdmin && actorMode === "admin") {
    return { label: "Needs your approval", variant: "destructive" };
  }
  const current = stages?.find((s) => s.key === summary.currentStageKey);
  if (current && isActionableForActor(current, actorMode)) {
    return { label: "Action needed", variant: "default" };
  }
  if (summary.currentStageKey === "commission" && current?.state === "verified") {
    return { label: "Complete", variant: "outline" };
  }
  return { label: "In progress", variant: "outline" };
}

function primaryButtonLabel(stage: PipelineStageView, actorMode: PipelineActorMode): string {
  const short = stageShortTitle(stage.key, stage.title);
  if (actorMode === "admin") {
    if (stage.key === "advance_verify" || stage.key === "final_verify") {
      return "Review payment";
    }
    if (stage.key === "commission") {
      return "Mark commission paid";
    }
    if (stage.key === "build_demo") {
      return stage.hint ? "Mark demo ready" : "Save preview link";
    }
    if (stage.key === "demo_finalized") return "Verify demo approved";
    if (stage.key === "accounts_ready") return "Verify accounts ready";
    if (stage.key === "repo_transfer") return "Verify repo transfer";
    if (stage.key === "deployment_verify") return "Verify deployment";
    return `Review: ${short}`;
  }
  switch (stage.key) {
    case "lead_capture":
      return "Edit lead details";
    case "convert_deal":
      return "Submit for approval";
    case "whatsapp_group":
      return "Save group link";
    case "demo_finalized":
      return "Mark demo approved";
    case "accounts_ready":
      return "Mark accounts ready";
    case "final_payment":
      return "Record due payment";
    case "deployment_submit":
      return "Submit live URL";
    default:
      return `Continue: ${short}`;
  }
}

function focusDescription(stage: PipelineStageView, actorMode: PipelineActorMode): string {
  if (stage.state === "locked" && stage.blockedReason) {
    return stage.blockedReason;
  }
  if (stage.state === "pending_admin" && actorMode === "rep") {
    return `You submitted “${stageShortTitle(stage.key, stage.title)}”. Admin will review it soon.`;
  }
  if (stage.key === "build_demo" && stage.hint && actorMode === "rep") {
    return "Technical team is preparing the demo link. You will be notified when it is ready.";
  }
  if (actorMode === "admin" && (stage.key === "advance_verify" || stage.key === "final_verify")) {
    return "Check the payment details and approve or decline with a provider reference.";
  }
  if (actorMode === "admin" && stage.key === "convert_deal") {
    return "Review the deal details, then verify the advance payment from the payment step.";
  }
  if (actorMode === "admin" && stage.key === "build_demo" && stage.state === "actionable") {
    return "Step 1: Save the staging or preview link. Step 2: Mark demo ready so the rep can continue.";
  }
  if (actorMode === "rep" && stage.state === "actionable") {
    return `Complete “${stageShortTitle(stage.key, stage.title)}” to move this project forward.`;
  }
  if (actorMode === "admin" && stage.state === "actionable" && stage.key !== "build_demo") {
    return `Review what the rep submitted for “${stageShortTitle(stage.key, stage.title)}”.`;
  }
  return whoActsNext(stage, actorMode);
}

export function getPipelineFocus(
  stages: PipelineStageView[],
  actorMode: PipelineActorMode
): PipelineFocus {
  const waiting =
    actorMode === "rep"
      ? stages.find((s) => s.state === "pending_admin" && s.repActor)
      : stages.find((s) => isWaitingForActor(s, actorMode));

  if (waiting) {
    const viewOnly = actorMode === "rep" && waiting.state === "pending_admin";
    return {
      kind: "waiting",
      stage: waiting,
      stageKey: waiting.key,
      headline: viewOnly ? "Waiting for admin" : stageShortTitle(waiting.key, waiting.title),
      description: focusDescription(waiting, actorMode),
      primaryLabel: viewOnly ? "View what you submitted" : primaryButtonLabel(waiting, actorMode),
      showViewSubmission: viewOnly
    };
  }

  const actionable = stages.find((s) => isActionableForActor(s, actorMode));
  if (actionable) {
    return {
      kind: "action",
      stage: actionable,
      stageKey: actionable.key,
      headline: stageShortTitle(actionable.key, actionable.title),
      description: focusDescription(actionable, actorMode),
      primaryLabel: primaryButtonLabel(actionable, actorMode),
      showViewSubmission: false
    };
  }

  const lastVerified = [...stages].reverse().find((s) => s.state === "verified");
  return {
    kind: "idle",
    stage: lastVerified ?? null,
    stageKey: lastVerified?.key ?? null,
    headline: "You are caught up",
    description: lastVerified
      ? `Latest completed step: ${stageShortTitle(lastVerified.key, lastVerified.title)}.`
      : "No steps are waiting on you right now.",
    primaryLabel: lastVerified ? "View last step" : null,
    showViewSubmission: false
  };
}

export function tickAriaLabel(state: StageUiState, adminVerified: boolean): string {
  if (state === "verified") {
    return adminVerified ? "Verified by admin" : "Completed";
  }
  if (state === "pending_admin") return "Waiting for admin approval";
  if (state === "actionable") return "Your action needed";
  return "Not started yet";
}

export function stageWasAdminVerified(key: PipelineStageKey): boolean {
  return key !== "lead_capture" && key !== "convert_deal" && key !== "demo_finalized";
}

export function listWaitingSubline(
  summary: LeadPipelineSummary,
  actorMode: PipelineActorMode
): string | null {
  if (actorMode === "rep" && summary.pendingAdmin) {
    return "Admin will review soon.";
  }
  return null;
}

const NEXT_STEP_HINTS: Partial<
  Record<PipelineStageKey, Partial<Record<PipelineActorMode, string>>>
> = {
  lead_capture: {
    rep: "Next: convert to a client and record the advance payment."
  },
  convert_deal: {
    rep: "Next: wait for admin to verify the advance payment."
  },
  whatsapp_group: {
    rep: "Next: admin verifies the group, then the technical team shares a demo link."
  },
  demo_finalized: {
    rep: "Next: admin verifies, then you mark accounts ready.",
    admin: "Next: rep can mark accounts ready after you verify."
  },
  accounts_ready: {
    rep: "Next: admin verifies, then you record the due payment.",
    admin: "Next: rep records due payment; you verify it on Payments or Reviews."
  },
  final_payment: {
    rep: "Next: admin verifies the due payment, then repo transfer and deployment."
  },
  deployment_submit: {
    rep: "Next: admin verifies the live site; commission is calculated after that."
  },
  build_demo: {
    admin: "Next: mark demo ready so the rep can show the site to the client."
  },
  repo_transfer: {
    admin: "Next: rep submits the live URL for you to verify."
  },
  deployment_verify: {
    admin: "Next: mark commission paid when payout is complete."
  },
  advance_verify: {
    admin: "Next: rep adds the WhatsApp group link."
  },
  final_verify: {
    admin: "Next: verify repo transfer, then rep deploys the live URL."
  }
};

export function stageNextStepHint(
  key: PipelineStageKey,
  actorMode: PipelineActorMode
): string | undefined {
  return NEXT_STEP_HINTS[key]?.[actorMode];
}
