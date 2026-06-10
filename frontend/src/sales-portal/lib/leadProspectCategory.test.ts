import { describe, expect, it } from "vitest";
import {
  canChangeProspectCategory,
  canMarkNotInterested,
  interestedSampleLabel,
  isProspectArchived,
  prospectCategoryLabel
} from "./leadProspectCategory";

describe("leadProspectCategory", () => {
  it("labels categories", () => {
    expect(prospectCategoryLabel("INTERESTED")).toBe("Interested");
    expect(prospectCategoryLabel("NOT_INTERESTED")).toBe("Not interested");
  });

  it("detects archived prospects", () => {
    expect(
      isProspectArchived({ convertedAt: null, prospectCategory: "NOT_INTERESTED" })
    ).toBe(true);
    expect(
      isProspectArchived({ convertedAt: null, prospectCategory: "NEW_LEAD" })
    ).toBe(false);
  });

  it("canMarkNotInterested mirrors server eligibility", () => {
    expect(
      canMarkNotInterested({
        prospectCategory: "NEW_LEAD",
        convertedAt: null,
        status: "NEW",
        payments: [],
        project: null
      })
    ).toBe(true);
    expect(
      canMarkNotInterested({
        prospectCategory: "NOT_INTERESTED",
        convertedAt: null,
        status: "NEW",
        payments: [],
        project: null
      })
    ).toBe(false);
    expect(
      canMarkNotInterested({
        prospectCategory: "NEW_LEAD",
        convertedAt: "2026-01-01T00:00:00.000Z",
        status: "ADVANCE_PAID",
        payments: [],
        project: null
      })
    ).toBe(false);
  });

  it("canChangeProspectCategory for unconverted leads", () => {
    expect(
      canChangeProspectCategory({
        prospectCategory: "FOLLOW_UP",
        convertedAt: null,
        status: "NEW"
      })
    ).toBe(true);
  });

  it("formats interested sample labels", () => {
    expect(interestedSampleLabel(true)).toBe("Sample shared");
    expect(interestedSampleLabel(false)).toBe("Sample pending");
  });
});
