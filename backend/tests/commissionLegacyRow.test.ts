import { CommissionModel } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  commissionIntegrityIssuesForModel,
  resolveEffectiveCommissionRowModel
} from "../src/services/commissionRules.js";
import { MODEL_B_MILESTONE_AMOUNT_CENTS, MODEL_B_PER_DEAL_AFTER_CENTS } from "../src/services/commissionModel.js";
import { portalSettingsSchema } from "../src/validators/schemas.js";

const settings = portalSettingsSchema.parse({});

describe("legacy Model A commission rows on Model B reps", () => {
  it("treats pre-conversion percentage rows as Model A for integrity", () => {
    const lead = { agreedTotalCents: 799_900 };
    const commission = { amountCents: 199_975 };
    const deployedOrdinal = 2;

    expect(
      resolveEffectiveCommissionRowModel(
        CommissionModel.MODEL_B,
        lead,
        commission,
        settings,
        deployedOrdinal
      )
    ).toBe(CommissionModel.MODEL_A);

    expect(
      commissionIntegrityIssuesForModel(
        lead,
        commission,
        settings,
        CommissionModel.MODEL_A,
        deployedOrdinal
      )
    ).toEqual([]);
  });

  it("keeps Model B fixed rows on deal 6+", () => {
    const lead = { agreedTotalCents: 100_000 };
    const commission = { amountCents: MODEL_B_PER_DEAL_AFTER_CENTS };

    expect(
      resolveEffectiveCommissionRowModel(
        CommissionModel.MODEL_B,
        lead,
        commission,
        settings,
        6
      )
    ).toBe(CommissionModel.MODEL_B);
  });

  it("keeps milestone payout amount as Model B", () => {
    const lead = { agreedTotalCents: 100_000 };
    const commission = { amountCents: MODEL_B_MILESTONE_AMOUNT_CENTS };

    expect(
      resolveEffectiveCommissionRowModel(
        CommissionModel.MODEL_B,
        lead,
        commission,
        settings,
        5
      )
    ).toBe(CommissionModel.MODEL_B);
  });

  it("accepts milestone payout row at ordinal 5", () => {
    const lead = { agreedTotalCents: 100_000 };
    const commission = { amountCents: MODEL_B_MILESTONE_AMOUNT_CENTS };

    expect(
      commissionIntegrityIssuesForModel(
        lead,
        commission,
        settings,
        CommissionModel.MODEL_B,
        5
      )
    ).toEqual([]);
  });

  it("rejects per-deal amount at ordinal 5 for Model B", () => {
    const lead = { agreedTotalCents: 100_000 };
    const commission = { amountCents: MODEL_B_PER_DEAL_AFTER_CENTS };

    expect(
      commissionIntegrityIssuesForModel(
        lead,
        commission,
        settings,
        CommissionModel.MODEL_B,
        5
      ).length
    ).toBeGreaterThan(0);
  });
});
