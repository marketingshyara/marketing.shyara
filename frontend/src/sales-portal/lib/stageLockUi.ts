import type { Lead, PipelineStageKey, PipelineStageView } from "../types";

/** Must match backend `pipeline.ts` rep verified lock hint. */
export const REP_ADMIN_LOCK_HINT = "Locked after admin approval.";

export function isRepAdminLockedVerified(stage: PipelineStageView): boolean {
  return (
    stage.repActor &&
    stage.state === "verified" &&
    stage.hint === REP_ADMIN_LOCK_HINT
  );
}

/** Rep stage modal is view-only (no save / mark actions). */
export function repStageModalReadOnly(
  stage: PipelineStageView | undefined,
  stageKey: PipelineStageKey,
  lead: Pick<Lead, "convertedAt">
): boolean {
  if (!stage) return false;
  if (stage.state === "pending_admin" && stage.repActor) return true;
  if (stageKey === "convert_deal" && lead.convertedAt) return true;
  if (stageKey === "build_demo") return true;
  if (isRepAdminLockedVerified(stage)) return true;
  return false;
}

export function repStageModalTitle(
  stageKey: PipelineStageKey,
  readOnly: boolean,
  stage: PipelineStageView | undefined
): string {
  if (stageKey === "lead_capture") {
    if (readOnly && stage?.state === "pending_admin") return "Client details submitted";
    if (readOnly && stage?.state === "verified") return "Client details";
    return leadCaptureEditTitle(stage);
  }
  if (stageKey === "convert_deal" && readOnly) return "Deal submitted";
  if (stageKey === "whatsapp_group" && readOnly) return "WhatsApp group";
  if (stageKey === "demo_finalized" && readOnly) return "Demo approved";
  if (stageKey === "accounts_ready" && readOnly) return "Accounts ready";
  if (stageKey === "final_payment" && readOnly) return "Due payment";
  if (stageKey === "deployment_submit" && readOnly) return "Live website";
  return defaultStageTitles[stageKey] ?? "Stage";
}

function leadCaptureEditTitle(stage: PipelineStageView | undefined): string {
  return stage?.adminActor ? "Update client details" : "Lead details";
}

const defaultStageTitles: Partial<Record<PipelineStageKey, string>> = {
  lead_capture: "Lead details",
  convert_deal: "Convert to client",
  whatsapp_group: "WhatsApp group",
  build_demo: "Demo preview link",
  demo_finalized: "Demo approved",
  accounts_ready: "Accounts ready",
  final_payment: "Record due payment",
  deployment_submit: "Submit live URL"
};
