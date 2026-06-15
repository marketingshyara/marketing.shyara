import { CommissionModel } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  MODEL_B_MILESTONE_AMOUNT_CENTS,
  MODEL_B_MILESTONE_TARGET,
  MODEL_B_PER_DEAL_AFTER_CENTS,
  computeModelBEarningsCents,
  computeModelBCommissionAmountCents,
  modelBNextPayoutHint,
  shouldUpsertCommissionOnDeploymentVerify
} from "../src/services/commissionModel.js";
import { toRepPortalSettingsForModel } from "../src/services/settings.js";
import { portalSettingsSchema } from "../src/validators/schemas.js";

describe("commissionModel helpers", () => {
  it("shouldUpsertCommissionOnDeploymentVerify respects model rules", () => {
    expect(shouldUpsertCommissionOnDeploymentVerify(CommissionModel.MODEL_A, 1)).toBe(true);
    expect(shouldUpsertCommissionOnDeploymentVerify(CommissionModel.MODEL_B, 4)).toBe(false);
    expect(shouldUpsertCommissionOnDeploymentVerify(CommissionModel.MODEL_B, 5)).toBe(false);
    expect(shouldUpsertCommissionOnDeploymentVerify(CommissionModel.MODEL_B, 6)).toBe(true);
  });

  it("computeModelBCommissionAmountCents returns null until deal 6+", () => {
    expect(computeModelBCommissionAmountCents(1)).toBeNull();
    expect(computeModelBCommissionAmountCents(5)).toBeNull();
    expect(computeModelBCommissionAmountCents(6)).toBe(MODEL_B_PER_DEAL_AFTER_CENTS);
  });

  it("computeModelBEarningsCents aggregates milestone and per-deal payouts", () => {
    expect(computeModelBEarningsCents(0)).toBe(0);
    expect(computeModelBEarningsCents(4)).toBe(0);
    expect(computeModelBEarningsCents(5)).toBe(MODEL_B_MILESTONE_AMOUNT_CENTS);
    expect(computeModelBEarningsCents(6)).toBe(
      MODEL_B_MILESTONE_AMOUNT_CENTS + MODEL_B_PER_DEAL_AFTER_CENTS
    );
    expect(computeModelBEarningsCents(10)).toBe(
      MODEL_B_MILESTONE_AMOUNT_CENTS + 5 * MODEL_B_PER_DEAL_AFTER_CENTS
    );
  });

  it("modelBNextPayoutHint guides reps by deployed and paid counts", () => {
    expect(modelBNextPayoutHint(2, 0)).toContain("3 more");
    expect(modelBNextPayoutHint(5, 0)).toContain("pending admin");
    expect(modelBNextPayoutHint(6, 5)).toContain("₹2000");
  });
});

describe("toRepPortalSettingsForModel", () => {
  const values = portalSettingsSchema.parse({});

  it("exposes rate fields for Model A only", () => {
    const modelA = toRepPortalSettingsForModel(CommissionModel.MODEL_A, values);
    expect(modelA.commissionRateBps).toBe(2500);
    expect(modelA).toHaveProperty("performanceBonusBps");
    expect(modelA).not.toHaveProperty("milestoneTarget");
  });

  it("omits rate fields for Model B and returns milestone constants", () => {
    const modelB = toRepPortalSettingsForModel(CommissionModel.MODEL_B, values);
    expect(modelB.commissionModel).toBe(CommissionModel.MODEL_B);
    expect(modelB).not.toHaveProperty("commissionRateBps");
    expect(modelB).not.toHaveProperty("performanceBonusBps");
    expect(modelB.milestoneTarget).toBe(MODEL_B_MILESTONE_TARGET);
    expect(modelB.milestoneAmountCents).toBe(MODEL_B_MILESTONE_AMOUNT_CENTS);
    expect(modelB.perDealAfterCents).toBe(MODEL_B_PER_DEAL_AFTER_CENTS);
  });
});
