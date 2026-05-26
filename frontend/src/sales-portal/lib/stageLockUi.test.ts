import { describe, expect, it } from "vitest";
import {
  isRepAdminLockedVerified,
  repConvertDealModalMode,
  repConvertDealTemplateEditable,
  repConvertDealTermsReadOnly,
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

  it("convert_deal stays editable for template until WhatsApp verified", () => {
    const lead = {
      convertedAt: "2026-01-01T00:00:00.000Z",
      whatsappVerifiedAt: null as string | null
    };
    expect(repConvertDealTemplateEditable(lead)).toBe(true);
    expect(repConvertDealTermsReadOnly(lead)).toBe(true);
    expect(repConvertDealModalMode(lead)).toBe("post_convert_editable");
    expect(
      repStageModalReadOnly(
        stage({ key: "convert_deal", state: "pending_admin", repActor: true }),
        "convert_deal",
        lead
      )
    ).toBe(false);
  });

  it("convert_deal locks after WhatsApp verified", () => {
    const lead = {
      convertedAt: "2026-01-01T00:00:00.000Z",
      whatsappVerifiedAt: "2026-01-02T00:00:00.000Z"
    };
    expect(repConvertDealTemplateEditable(lead)).toBe(false);
    expect(repConvertDealModalMode(lead)).toBe("post_convert_locked");
    expect(
      repStageModalReadOnly(
        stage({ key: "convert_deal", state: "pending_admin", repActor: true }),
        "convert_deal",
        lead
      )
    ).toBe(true);
  });
});
