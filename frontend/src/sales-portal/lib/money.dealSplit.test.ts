import { describe, expect, it } from "vitest";
import { resolveDealSplitDisplay, splitAgreedTotalCents } from "./money";

describe("resolveDealSplitDisplay", () => {
  it("uses server amounts when lead is converted", () => {
    const out = resolveDealSplitDisplay(
      {
        convertedAt: "2026-01-01T00:00:00.000Z",
        advanceAmountCents: 100,
        finalQuoteCents: 200
      },
      splitAgreedTotalCents(999, 5000)
    );
    expect(out).toEqual({
      advanceCents: 100,
      dueCents: 200,
      fromServer: true
    });
  });

  it("uses live preview before convert", () => {
    const preview = splitAgreedTotalCents(799_900, 5000);
    const out = resolveDealSplitDisplay(
      {
        convertedAt: null,
        advanceAmountCents: null,
        finalQuoteCents: null
      },
      preview
    );
    expect(out.fromServer).toBe(false);
    expect(out.advanceCents).toBe(preview.advanceAmountCents);
    expect(out.dueCents).toBe(preview.finalQuoteCents);
  });

  it("returns null amounts when no preview and not converted", () => {
    expect(
      resolveDealSplitDisplay(
        { convertedAt: null, advanceAmountCents: null, finalQuoteCents: null },
        null
      )
    ).toEqual({ advanceCents: null, dueCents: null, fromServer: false });
  });
});
