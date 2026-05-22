import { describe, expect, it } from "vitest";
import {
  getPipelineFocus,
  listStatusChip,
  listWaitingSubline,
  stageNextStepHint,
  stageShortTitle
} from "./pipelineCopy";
import type { LeadPipelineSummary } from "../types";
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
    expect(focus.statusChip.kind).toBe("waiting");
  });

  it("surfaces decline note on actionable focus detail", () => {
    const focus = getPipelineFocus(
      [stage("accounts_ready", "actionable", { declineNote: "Use client GitHub org" })],
      "rep"
    );
    expect(focus.kind).toBe("action");
    expect(focus.detail).toBe("Use client GitHub org");
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
    expect(focus.primaryLabel).toMatch(/verify demo approved/i);
  });

  it("returns caught up when no actionable or waiting stages", () => {
    const focus = getPipelineFocus(
      [stage("convert_deal", "locked", { blockedReason: "Complete lead details first." })],
      "rep"
    );
    expect(focus.kind).toBe("idle");
    expect(focus.headline).toMatch(/caught up/i);
  });
});

describe("stageShortTitle", () => {
  it("returns friendly short label", () => {
    expect(stageShortTitle("convert_deal")).toBe("Convert to client");
  });
});

describe("listStatusChip", () => {
  it("maps pending admin for rep to waiting chip", () => {
    const chip = listStatusChip({ pendingAdmin: true } as LeadPipelineSummary, undefined, "rep");
    expect(chip.kind).toBe("waiting");
  });
});

describe("listWaitingSubline", () => {
  const pendingSummary = { pendingAdmin: true } as LeadPipelineSummary;

  it("returns null (deprecated)", () => {
    expect(listWaitingSubline(pendingSummary, "rep")).toBeNull();
    expect(listWaitingSubline({ pendingAdmin: false } as LeadPipelineSummary, "rep")).toBeNull();
  });
});

describe("stageNextStepHint", () => {
  it("returns rep hint after convert", () => {
    expect(stageNextStepHint("convert_deal", "rep")).toMatch(/advance/i);
  });

  it("returns admin hint after advance verify", () => {
    expect(stageNextStepHint("advance_verify", "admin")).toMatch(/whatsapp/i);
  });

  it("returns undefined when no hint defined", () => {
    expect(stageNextStepHint("commission", "rep")).toBeUndefined();
  });
});
