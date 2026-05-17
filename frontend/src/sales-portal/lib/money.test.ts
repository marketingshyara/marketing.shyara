import { describe, expect, it } from "vitest";
import { estimateCommissionCents, splitAgreedTotalCents } from "./money";

describe("splitAgreedTotalCents", () => {
  it("matches backend 50/50 split", () => {
    expect(splitAgreedTotalCents(10_000, 5000)).toEqual({
      advanceAmountCents: 5000,
      finalQuoteCents: 5000
    });
  });
});

describe("estimateCommissionCents", () => {
  it("computes 20% with bankers rounding", () => {
    expect(estimateCommissionCents(100_000, 2000, "bankers")).toBe(20_000);
  });
});
