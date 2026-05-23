import { declineFeedbackMessage } from "./declineFeedback";
import type { PortalStatusChipKind } from "../components/ui/PortalStatusChip";
import type {
  LeadPipelineSummary,
  PipelineStageKey,
  PipelineStageView,
  StageUiState
} from "../types";
import { isRepAdminLockedVerified } from "./stageLockUi";

export type PipelineActorMode = "rep" | "admin";

export type PipelineFocusKind = "action" | "waiting" | "idle";

export type PipelineFocus = {
  kind: PipelineFocusKind;
  stage: PipelineStageView | null;
  stageKey: PipelineStageKey | null;
  headline: string;
  /** Short line under headline; omit when chip + headline are enough */
  detail: string | null;
  statusChip: { kind: PortalStatusChipKind; label: string };
  /** Extra context for "Why blocked?" collapsible */
  expandReasons: string[];
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
    return actorMode === "rep" ? "Your turn" : "Needs approval";
  }
  if (stage.state === "pending_admin") {
    return actorMode === "rep" ? "Waiting on admin" : "Needs approval";
  }
  if (stage.state === "verified") {
    return "Complete";
  }
  return "Not started";
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

export function focusStatusKind(
  focusKind: PipelineFocusKind,
  stage: PipelineStageView | null,
  actorMode: PipelineActorMode
): { kind: PortalStatusChipKind; label: string } {
  if (focusKind === "idle") {
    return { kind: "complete", label: "Caught up" };
  }
  if (!stage) {
    return focusKind === "action"
      ? { kind: "action", label: "Action needed" }
      : { kind: "waiting", label: "Waiting on admin" };
  }
  if (stage.state === "locked") {
    return { kind: "locked", label: "Blocked" };
  }
  if (focusKind === "waiting") {
    return actorMode === "rep"
      ? { kind: "waiting", label: "Waiting on admin" }
      : { kind: "action", label: "Needs approval" };
  }
  if (stage.key === "build_demo" && stage.hint && actorMode === "rep") {
    return { kind: "waiting", label: "Technical team" };
  }
  return actorMode === "admin"
    ? { kind: "action", label: "Needs approval" }
    : { kind: "action", label: "Your turn" };
}

export function listBadgeLabel(
  summary: LeadPipelineSummary,
  stages: PipelineStageView[] | undefined,
  actorMode: PipelineActorMode
): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  const buildWaiting = stages?.find((s) => s.key === "build_demo" && s.hint);
  if (buildWaiting && actorMode === "rep") {
    return { label: "Technical team", variant: "secondary" };
  }
  if (summary.pendingAdmin && actorMode === "rep") {
    return { label: "Waiting on admin", variant: "secondary" };
  }
  if (summary.pendingAdmin && actorMode === "admin") {
    return { label: "Needs approval", variant: "destructive" };
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

export function listStatusChip(
  summary: LeadPipelineSummary,
  stages: PipelineStageView[] | undefined,
  actorMode: PipelineActorMode
): { kind: PortalStatusChipKind; label: string } {
  const badge = listBadgeLabel(summary, stages, actorMode);
  if (badge.label === "Complete") return { kind: "complete", label: badge.label };
  if (badge.label === "Action needed" || badge.label === "Needs approval") {
    return { kind: "action", label: badge.label };
  }
  if (badge.label === "Waiting on admin" || badge.label === "Technical team") {
    return { kind: "waiting", label: badge.label };
  }
  return { kind: "idle", label: badge.label };
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
    if (stage.key === "lead_capture" && stage.state === "pending_admin") {
      return "Verify client details";
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
  if (actorMode === "rep" && isRepAdminLockedVerified(stage)) {
    return "View verified step";
  }
  switch (stage.key) {
    case "lead_capture":
      return stage.state === "pending_admin"
        ? "View submission"
        : stage.adminActor
          ? "Update client details"
          : "Edit lead details";
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

function focusDetail(stage: PipelineStageView, actorMode: PipelineActorMode): string | null {
  if (stage.declineNote !== undefined) {
    return declineFeedbackMessage(stage.declineNote);
  }
  if (stage.state === "locked" && stage.blockedReason) {
    return stage.blockedReason;
  }
  if (stage.key === "build_demo" && stage.hint && actorMode === "rep") {
    return "Demo link in progress.";
  }
  if (actorMode === "admin" && stage.key === "build_demo" && stage.state === "actionable") {
    return "Save preview URL, then mark demo ready.";
  }
  if (actorMode === "admin" && (stage.key === "advance_verify" || stage.key === "final_verify")) {
    return "Approve with provider reference.";
  }
  if (actorMode === "rep" && isRepAdminLockedVerified(stage)) {
    return stage.hint ?? "Locked after admin approval.";
  }
  if (actorMode === "rep" && stage.key === "lead_capture" && stage.state === "pending_admin") {
    return "Updated client details are waiting for admin approval.";
  }
  return null;
}

function focusExpandReasonsFixed(
  stage: PipelineStageView,
  actorMode: PipelineActorMode,
  kind: PipelineFocusKind
): string[] {
  const reasons: string[] = [];
  if (stage.state === "locked" && stage.blockedReason) {
    reasons.push(stage.blockedReason);
  }
  if (stage.state === "pending_admin" && actorMode === "rep") {
    reasons.push("Admin reviews your submission before the next step unlocks.");
  }
  if (kind === "waiting" && actorMode === "admin" && stage.state === "pending_admin") {
    reasons.push("Rep submitted this step. Approve or decline to continue.");
  }
  if (actorMode === "admin" && stage.key === "convert_deal" && stage.state === "actionable") {
    reasons.push("Verify advance payment on Payments after reviewing the deal.");
  }
  if (actorMode === "admin" && stage.key === "repo_transfer") {
    reasons.push("Confirm repo ownership moved to the client before deployment.");
  }
  if (stage.declineNote !== undefined) {
    reasons.push(declineFeedbackMessage(stage.declineNote));
  }
  return reasons;
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
    const kind: PipelineFocusKind = "waiting";
    return {
      kind,
      stage: waiting,
      stageKey: waiting.key,
      headline: viewOnly ? "Waiting for admin" : stageShortTitle(waiting.key, waiting.title),
      detail: focusDetail(waiting, actorMode),
      statusChip: focusStatusKind(kind, waiting, actorMode),
      expandReasons: focusExpandReasonsFixed(waiting, actorMode, kind),
      primaryLabel: viewOnly ? "View submission" : primaryButtonLabel(waiting, actorMode),
      showViewSubmission: viewOnly
    };
  }

  const actionable = stages.find((s) => isActionableForActor(s, actorMode));
  if (actionable) {
    const kind: PipelineFocusKind = "action";
    return {
      kind,
      stage: actionable,
      stageKey: actionable.key,
      headline: stageShortTitle(actionable.key, actionable.title),
      detail: focusDetail(actionable, actorMode),
      statusChip: focusStatusKind(kind, actionable, actorMode),
      expandReasons: focusExpandReasonsFixed(actionable, actorMode, kind),
      primaryLabel: primaryButtonLabel(actionable, actorMode),
      showViewSubmission: false
    };
  }

  const lastVerified = [...stages].reverse().find((s) => s.state === "verified");
  const kind: PipelineFocusKind = "idle";
  return {
    kind,
    stage: lastVerified ?? null,
    stageKey: lastVerified?.key ?? null,
    headline: "Caught up",
    detail: lastVerified
      ? `Last: ${stageShortTitle(lastVerified.key, lastVerified.title)}`
      : null,
    statusChip: focusStatusKind(kind, lastVerified ?? null, actorMode),
    expandReasons: [],
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

/** @deprecated Use listStatusChip; kept for gradual migration */
export function listWaitingSubline(
  _summary: LeadPipelineSummary,
  _actorMode: PipelineActorMode
): string | null {
  return null;
}

const NEXT_STEP_HINTS: Partial<
  Record<PipelineStageKey, Partial<Record<PipelineActorMode, string>>>
> = {
  lead_capture: { rep: "Convert client + advance" },
  convert_deal: { rep: "Admin verifies advance" },
  whatsapp_group: { rep: "Admin verifies → demo build" },
  demo_finalized: {
    rep: "Admin verifies → accounts",
    admin: "Rep marks accounts ready"
  },
  accounts_ready: {
    rep: "Admin verifies → due payment",
    admin: "Rep records due payment"
  },
  final_payment: { rep: "Admin verifies → deploy" },
  deployment_submit: { rep: "Admin verifies → commission" },
  build_demo: { admin: "Mark demo ready" },
  repo_transfer: { admin: "Rep submits live URL" },
  deployment_verify: { admin: "Mark commission paid" },
  advance_verify: { admin: "Rep adds WhatsApp link" },
  final_verify: { admin: "Verify repo → deploy" }
};

export function stageNextStepHint(
  key: PipelineStageKey,
  actorMode: PipelineActorMode
): string | undefined {
  return NEXT_STEP_HINTS[key]?.[actorMode];
}
