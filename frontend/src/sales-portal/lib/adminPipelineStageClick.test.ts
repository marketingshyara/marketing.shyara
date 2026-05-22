import { describe, expect, it } from "vitest";
import { adminCanOpenStageModal } from "./adminPipelineStageClick";
import type { PipelineStageView } from "../types";

function stage(
  state: PipelineStageView["state"],
  adminActor = true
): PipelineStageView {
  return {
    key: "accounts_ready",
    title: "Accounts ready",
    repActor: true,
    adminActor,
    state
  };
}

describe("adminCanOpenStageModal", () => {
  it("allows verified admin stages (View last step / progress list)", () => {
    expect(adminCanOpenStageModal(stage("verified"))).toBe(true);
  });

  it("allows actionable and pending_admin", () => {
    expect(adminCanOpenStageModal(stage("actionable"))).toBe(true);
    expect(adminCanOpenStageModal(stage("pending_admin"))).toBe(true);
  });

  it("blocks locked and rep-only stages", () => {
    expect(adminCanOpenStageModal(stage("locked"))).toBe(false);
    expect(adminCanOpenStageModal(stage("verified", false))).toBe(false);
  });
});
