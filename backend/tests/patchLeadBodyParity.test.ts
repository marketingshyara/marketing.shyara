import { describe, expect, it } from "vitest";
import {
  assertAdminLeadPatchBody,
  REP_ONLY_LEAD_PATCH_FIELDS,
  wasPatchFieldSent
} from "../src/services/leadMutations.js";
import { patchLeadBodySchema } from "../src/validators/schemas.js";

const ADMIN_PATCH_SAMPLES: Record<string, unknown>[] = [
  { previewUrl: "staging.example.com/demo" },
  { assignedToUserId: "clxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { previewUrl: "https://a.example", assignedToUserId: null }
];

describe("patchLeadBodySchema parity (no phantom rep fields)", () => {
  it.each(ADMIN_PATCH_SAMPLES)("admin sample %# does not inject rep-only keys", (raw) => {
    const parsed = patchLeadBodySchema.parse(raw);
    for (const key of REP_ONLY_LEAD_PATCH_FIELDS) {
      expect(parsed).not.toHaveProperty(key);
    }
    expect(() => assertAdminLeadPatchBody(raw as Record<string, unknown>)).not.toThrow();
  });

  it("rep-only keys in raw body still fail admin guard", () => {
    for (const key of REP_ONLY_LEAD_PATCH_FIELDS) {
      const raw = { [key]: key === "clientPhone" ? null : key === "markDemoFinalized" ? true : "x" };
      expect(() => assertAdminLeadPatchBody(raw)).toThrow();
    }
  });
});

describe("wasPatchFieldSent", () => {
  it("treats omitted keys as not sent", () => {
    expect(wasPatchFieldSent({}, "clientPhone")).toBe(false);
    expect(wasPatchFieldSent({ previewUrl: "x.com" }, "clientPhone")).toBe(false);
  });

  it("treats null and values as sent", () => {
    expect(wasPatchFieldSent({ clientPhone: null }, "clientPhone")).toBe(true);
    expect(wasPatchFieldSent({ previewUrl: "https://x.com" }, "previewUrl")).toBe(true);
  });

  it("treats explicit undefined as not sent", () => {
    expect(wasPatchFieldSent({ clientPhone: undefined }, "clientPhone")).toBe(false);
  });
});
