import { describe, expect, it } from "vitest";
import {
  declineFeedbackMessage,
  findDeclineFeedbackStage
} from "./declineFeedback";
import type { PipelineStageView } from "../types";

function stage(
  key: PipelineStageView["key"],
  state: PipelineStageView["state"],
  declineNote?: string | null
): PipelineStageView {
  return {
    key,
    title: key,
    repActor: true,
    adminActor: true,
    state,
    ...(declineNote !== undefined ? { declineNote } : {})
  };
}

describe("declineFeedback", () => {
  it("uses generic message when note is null", () => {
    expect(declineFeedbackMessage(null)).toMatch(/declined this step/i);
    expect(declineFeedbackMessage("Fix the GitHub org name")).toBe("Fix the GitHub org name");
  });

  it("finds first stage with decline feedback", () => {
    const found = findDeclineFeedbackStage([
      stage("lead_capture", "verified"),
      stage("accounts_ready", "actionable", null)
    ]);
    expect(found?.key).toBe("accounts_ready");
  });
});
