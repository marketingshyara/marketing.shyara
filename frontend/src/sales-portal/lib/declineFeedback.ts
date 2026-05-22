import type { PipelineStageKey, PipelineStageView } from "../types";

export const DECLINE_GENERIC_MESSAGE =
  "Admin declined this step. Resubmit when ready.";

export function declineFeedbackMessage(note: string | null | undefined): string {
  if (note === undefined) return DECLINE_GENERIC_MESSAGE;
  const trimmed = note?.trim();
  return trimmed ? trimmed : DECLINE_GENERIC_MESSAGE;
}

/** First stage that should surface decline feedback for the current actor. */
export function findDeclineFeedbackStage(
  stages: PipelineStageView[]
): PipelineStageView | undefined {
  return stages.find((s) => s.declineNote !== undefined);
}

export function declineNoteForStage(
  stages: PipelineStageView[],
  key: PipelineStageKey
): string | null | undefined {
  return stages.find((s) => s.key === key)?.declineNote;
}
