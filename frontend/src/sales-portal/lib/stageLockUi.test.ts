import { describe, expect, it } from "vitest";
import {
  isRepAdminLockedVerified,
  repStageModalReadOnly,
  REP_ADMIN_LOCK_HINT
} from "./stageLockUi";
import type { PipelineStageView } from "../types";

function stage(overrides: Partial<PipelineStageView>): PipelineStageView {
  return {
    key: "whatsapp_group",
    title: "WhatsApp",
    repActor: true,
    adminActor: true,
    state: "verified",
    ...overrides
  };
}

describe("stageLockUi", () => {
  it("isRepAdminLockedVerified requires lock hint", () => {
    expect(
      isRepAdminLockedVerified(
        stage({ hint: REP_ADMIN_LOCK_HINT, state: "verified" })
      )
    ).toBe(true);
    expect(
      isRepAdminLockedVerified(stage({ state: "verified", hint: undefined }))
    ).toBe(false);
  });

  it("repStageModalReadOnly allows pre-convert lead_capture edit", () => {
    expect(
      repStageModalReadOnly(
        stage({ key: "lead_capture", state: "verified", hint: undefined, adminActor: false }),
        "lead_capture",
        { convertedAt: null }
      )
    ).toBe(false);
  });

  it("repStageModalReadOnly locks converted verified client details", () => {
    expect(
      repStageModalReadOnly(
        stage({
          key: "lead_capture",
          state: "verified",
          hint: REP_ADMIN_LOCK_HINT,
          adminActor: true
        }),
        "lead_capture",
        { convertedAt: "2026-01-01T00:00:00.000Z" }
      )
    ).toBe(true);
  });
});
