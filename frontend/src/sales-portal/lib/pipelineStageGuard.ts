import { toast } from "sonner";
import type { PipelineStageKey, PipelineStageView } from "../types";

/** Returns true if the action was blocked (toast shown). */
export function toastIfStageBlocked(
  stages: PipelineStageView[] | undefined,
  key: PipelineStageKey
): boolean {
  const stage = stages?.find((s) => s.key === key);
  if (stage?.state === "locked") {
    toast.error(stage.blockedReason ?? "Complete earlier steps first.");
    return true;
  }
  return false;
}
