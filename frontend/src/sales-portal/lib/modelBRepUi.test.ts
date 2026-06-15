import { describe, expect, it } from "vitest";
import {
  isModelBFixedPayoutCents,
  modelBRepPipelineStages,
  modelBRepPayoutStatusLabel,
  modelBRepPipelineStepLine,
  modelBRepShowsPipelinePayout,
  repLeadStatusLabel
} from "./modelBRepUi";
import { stageShortTitle } from "./pipelineCopy";

describe("modelBRepUi", () => {
  it("maps commission stage to Completed when verified", () => {
    const stages = modelBRepPipelineStages([
      {
        key: "commission",
        title: "Commission paid",
        repActor: false,
        adminActor: true,
        state: "verified",
        hint: "Paid within 3–5 business days"
      }
    ]);
    expect(stages[0]?.title).toBe("Completed");
    expect(stages[0]?.hint).toBeUndefined();
  });

  it("maps pending commission stage to Payout pending", () => {
    const stages = modelBRepPipelineStages([
      {
        key: "commission",
        title: "Commission",
        repActor: false,
        adminActor: true,
        state: "pending_admin",
        hint: "Paid within 3–5 business days after site is live"
      }
    ]);
    expect(stages[0]?.title).toBe("Payout pending");
    expect(stages[0]?.hint).toContain("Completed");
  });

  it("repLeadStatusLabel uses Completed for COMMISSION_PAID", () => {
    expect(repLeadStatusLabel("COMMISSION_PAID", true)).toBe("Completed");
    expect(repLeadStatusLabel("COMMISSION_PAID", false)).toBe("Commission Settled");
  });

  it("modelBRepPipelineStepLine maps list step labels", () => {
    expect(modelBRepPipelineStepLine("commission", "Commission paid", true)).toBe("Completed");
    expect(modelBRepPipelineStepLine("commission", "Commission", true)).toBe("Payout");
    expect(modelBRepPipelineStepLine("deployment_verify", "Deployment", true)).toBe(
      stageShortTitle("deployment_verify", "Deployment")
    );
  });

  it("uses Completed status label when paid", () => {
    expect(modelBRepPayoutStatusLabel(true)).toBe("Completed");
    expect(modelBRepPayoutStatusLabel(false)).toBe("Pending payout");
  });

  it("hides pipeline payout before milestone target", () => {
    expect(
      modelBRepShowsPipelinePayout(
        { amountCents: 1_000_000 },
        { deployedCount: 4, milestoneTarget: 5, paidEarningsCents: 0, nextPayoutHint: "", milestoneReady: false, milestoneReadyLeadId: null },
        {}
      )
    ).toBe(false);
  });

  it("shows fixed milestone payout after milestone target", () => {
    expect(
      modelBRepShowsPipelinePayout(
        { amountCents: 1_000_000 },
        { deployedCount: 5, milestoneTarget: 5, paidEarningsCents: 0, nextPayoutHint: "", milestoneReady: false, milestoneReadyLeadId: null },
        {}
      )
    ).toBe(true);
    expect(isModelBFixedPayoutCents(199_975, {})).toBe(false);
  });
});
