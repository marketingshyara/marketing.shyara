import type { PipelineStageView } from "../types";

/** Admin may open a stage modal to act or to review a completed (verified) step. */
export function adminCanOpenStageModal(stage: PipelineStageView): boolean {
  return (
    stage.adminActor &&
    (stage.state === "actionable" ||
      stage.state === "pending_admin" ||
      stage.state === "verified")
  );
}
