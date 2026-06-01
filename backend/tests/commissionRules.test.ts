import type { Commission, Lead } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { HttpError } from "../src/errors/httpError.js";
import {
  assertAgreedTotalMeetsMinimum,
  assertCommissionPayable,
  commissionIntegrityIssues,
  computeCommissionAmountCents,
  computePerformanceBonusCents,
  repQualifiesForPerformanceBonus
} from "../src/services/commissionRules.js";
import { portalSettingsSchema } from "../src/validators/schemas.js";

const settings = portalSettingsSchema.parse({
  minAgreedTotalCents: 799_900,
  commissionRateBps: 50,
  commissionRounding: "bankers"
});

function lead(partial: Partial<Lead>): Lead {
  return partial as Lead;
}

function commission(partial: Partial<Commission>): Commission {
  return partial as Commission;
}

describe("commissionRules", () => {
  it("assertAgreedTotalMeetsMinimum rejects sub-minimum", () => {
    expect(() => assertAgreedTotalMeetsMinimum(100_00, settings)).toThrow(HttpError);
    try {
      assertAgreedTotalMeetsMinimum(100_00, settings);
    } catch (e) {
      expect((e as HttpError).code).toBe("MIN_PRICE");
    }
  });

  it("computeCommissionAmountCents matches minimum deal at 0.5%", () => {
    const amount = computeCommissionAmountCents(
      lead({ agreedTotalCents: 799_900 }),
      settings
    );
    expect(amount).toBe(4_000);
  });

  it("flags integrity issues for bad test row", () => {
    const issues = commissionIntegrityIssues(
      lead({ agreedTotalCents: 100_00 }),
      commission({ amountCents: 400 }),
      settings
    );
    expect(issues.length).toBeGreaterThan(0);
  });

  it("assertCommissionPayable throws MIN_PRICE for sub-minimum deal", () => {
    try {
      assertCommissionPayable(
        lead({ agreedTotalCents: 100_00 }),
        commission({ amountCents: 400, isPaid: false }),
        settings
      );
      expect.fail("expected throw");
    } catch (e) {
      expect((e as HttpError).code).toBe("MIN_PRICE");
    }
  });

  it("assertCommissionPayable throws COMMISSION_INVALID when amount mismatches", () => {
    try {
      assertCommissionPayable(
        lead({ agreedTotalCents: 799_900 }),
        commission({ amountCents: 400, isPaid: false }),
        settings
      );
      expect.fail("expected throw");
    } catch (e) {
      expect((e as HttpError).code).toBe("COMMISSION_INVALID");
    }
  });

  it("computePerformanceBonusCents is 5% of agreed total with bankers rounding", () => {
    const bonusSettings = portalSettingsSchema.parse({
      minAgreedTotalCents: 799_900,
      commissionRateBps: 2000,
      commissionRounding: "bankers",
      performanceBonusBps: 500
    });
    expect(
      computePerformanceBonusCents(lead({ agreedTotalCents: 1_000_000 }), bonusSettings)
    ).toBe(50_000);
  });

  it("repQualifiesForPerformanceBonus when paid count meets threshold", () => {
    const bonusSettings = portalSettingsSchema.parse({
      performanceBonusAfterCompletedSales: 10,
      performanceBonusBps: 500
    });
    expect(repQualifiesForPerformanceBonus(9, bonusSettings)).toBe(false);
    expect(repQualifiesForPerformanceBonus(10, bonusSettings)).toBe(true);
  });

  it("passes for valid unpaid commission", () => {
    const agreed = 799_900;
    const amount = computeCommissionAmountCents(lead({ agreedTotalCents: agreed }), settings);
    expect(() =>
      assertCommissionPayable(
        lead({ agreedTotalCents: agreed }),
        commission({ amountCents: amount, isPaid: false }),
        settings
      )
    ).not.toThrow();
  });
});
