import { describe, expect, it } from "vitest";
import { LeadStatus } from "@prisma/client";
import {
  parsePortalSettings,
  patchPortalSettingsSchema,
  pickPortalSettingsPatchInput
} from "../src/validators/schemas.js";

describe("parsePortalSettings", () => {
  it("ignores unknown keys and still returns valid settings", () => {
    const settings = parsePortalSettings({
      foo: 1,
      legacyFlag: true,
      commissionRateBps: 1500
    });
    expect(settings.commissionRateBps).toBe(1500);
    expect(settings.exportMaxRows).toBeGreaterThan(0);
    expect(settings.terminalNoMutationStatuses).toContain(LeadStatus.COMMISSION_PAID);
  });

  it("parses empty object to defaults", () => {
    const settings = parsePortalSettings({});
    expect(settings.commissionRateBps).toBe(2000);
  });

  it("patch input ignores unknown keys before partial parse", () => {
    const picked = pickPortalSettingsPatchInput({
      commissionRateBps: 100,
      junk: true,
      extra: "x"
    });
    const partial = patchPortalSettingsSchema.parse(picked);
    expect(partial.commissionRateBps).toBe(100);
    expect(partial).not.toHaveProperty("junk");
  });
});
