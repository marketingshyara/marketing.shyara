import { describe, expect, it } from "vitest";
import { canDeleteProspect } from "./leadDelete";

describe("canDeleteProspect", () => {
  it("returns true for new unconverted prospect", () => {
    expect(
      canDeleteProspect({
        convertedAt: null,
        status: "NEW",
        payments: [],
        project: null
      })
    ).toBe(true);
  });

  it("returns false when converted", () => {
    expect(
      canDeleteProspect({
        convertedAt: "2026-01-01T00:00:00.000Z",
        status: "BUILDING",
        payments: [],
        project: null
      })
    ).toBe(false);
  });

  it("returns false when payment verified", () => {
    expect(
      canDeleteProspect({
        convertedAt: null,
        status: "NEW",
        payments: [{ verificationStatus: "VERIFIED" }],
        project: null
      })
    ).toBe(false);
  });
});
