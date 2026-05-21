import { describe, expect, it } from "vitest";
import { getPipelineFocus, stageShortTitle } from "./pipelineCopy";
import type { PipelineStageView } from "../types";

function stage(
  key: PipelineStageView["key"],
  state: PipelineStageView["state"],
  overrides: Partial<PipelineStageView> = {}
): PipelineStageView {
  return {
    key,
    title: key,
    repActor: true,
    adminActor: false,
    state,
    ...overrides
  };
}

describe("getPipelineFocus", () => {
  it("prioritizes rep pending_admin over actionable", () => {
    const stages: PipelineStageView[] = [
      stage("lead_capture", "verified"),
      stage("convert_deal", "pending_admin", { repActor: true, adminActor: false }),
      stage("whatsapp_group", "actionable", { repActor: true, adminActor: true })
    ];
    const focus = getPipelineFocus(stages, "rep");
    expect(focus.kind).toBe("waiting");
    expect(focus.stageKey).toBe("convert_deal");
    expect(focus.showViewSubmission).toBe(true);
  });

  it("picks admin pending approval before rep-only actionable", () => {
    const focus = getPipelineFocus(
      [
        stage("whatsapp_group", "verified", { repActor: true, adminActor: true }),
        {
          key: "demo_finalized",
          title: "Demo approved by client",
          repActor: true,
          adminActor: true,
          state: "pending_admin"
        }
      ],
      "admin"
    );
    expect(focus.kind).toBe("waiting");
    expect(focus.stageKey).toBe("demo_finalized");
    expect(focus.primaryLabel).toMatch(/review/i);
  });
});

describe("stageShortTitle", () => {
  it("returns friendly short label", () => {
    expect(stageShortTitle("convert_deal")).toBe("Convert to client");
  });
});
