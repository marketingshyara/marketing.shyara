import { describe, expect, it } from "vitest";
import type { CommissionListItem } from "../types";
import {
  commissionDataIssues,
  commissionRowStage,
  expectedCommissionCents,
  minimumExpectedCommissionCents,
  rowIntegrityIssues
} from "./commissionList";

const settings = {
  minAgreedTotalCents: 799_900,
  commissionRateBps: 50,
  commissionRounding: "bankers" as const,
  performanceBonusBps: 0
};

function row(overrides: Partial<CommissionListItem> = {}): CommissionListItem {
  return {
    id: "c1",
    leadId: "l1",
    repUserId: "r1",
    amountCents: 400,
    bonusCents: 0,
    isPaid: true,
    paidAt: "2026-05-12T00:00:00.000Z",
    paidByAdminId: "a1",
    createdAt: "2026-05-01T00:00:00.000Z",
    lead: {
      id: "l1",
      clientName: "him2",
      status: "COMMISSION_PAID",
      agreedTotalCents: 100_00,
      project: { deploymentVerifiedAt: "2026-05-01T00:00:00.000Z" }
    },
    rep: { id: "r1", displayName: "Rep" },
    expectedAmountCents: null,
    integrityIssues: [],
    ...overrides
  };
}

describe("commissionList", () => {
  it("flags sub-minimum deal and low commission (him2-style)", () => {
    const issues = commissionDataIssues(row(), settings);
    expect(issues.some((m) => m.includes("below the portal minimum"))).toBe(true);
    expect(issues.some((m) => m.includes("below minimum expected"))).toBe(true);
  });

  it("prefers server integrityIssues when present", () => {
    const serverRow = row({
      integrityIssues: ["Server flagged mismatch."],
      amountCents: 400
    });
    expect(rowIntegrityIssues(serverRow, settings)).toEqual(["Server flagged mismatch."]);
  });

  it("passes valid row at minimum deal and rate", () => {
    const base = settings.minAgreedTotalCents;
    const amount = minimumExpectedCommissionCents(settings);
    const good = row({
      amountCents: amount,
      lead: {
        id: "l1",
        clientName: "rish1",
        status: "COMMISSION_PAID",
        agreedTotalCents: base,
        project: { deploymentVerifiedAt: "2026-05-01T00:00:00.000Z" }
      }
    });
    expect(commissionDataIssues(good, settings)).toEqual([]);
    expect(expectedCommissionCents(good, settings)).toBe(amount);
  });

  it("skips Model A rate checks for Model B rows", () => {
    const modelBSettings = { ...settings, commissionModel: "MODEL_B" as const };
    const modelBRow = row({
      amountCents: 200_000,
      lead: {
        id: "l1",
        clientName: "b-rep",
        status: "DEPLOYED",
        agreedTotalCents: 100_00,
        project: { deploymentVerifiedAt: "2026-05-01T00:00:00.000Z" }
      },
      rep: { id: "r1", displayName: "Rep", commissionModel: "MODEL_B" }
    });
    expect(commissionDataIssues(modelBRow, modelBSettings)).toEqual([]);
  });

  it("derives row stage from deployment and paid flag", () => {
    expect(commissionRowStage(row())).toEqual({
      siteLive: true,
      calculated: true,
      paid: true
    });
    expect(
      commissionRowStage(
        row({
          isPaid: false,
          paidAt: null,
          lead: {
            id: "l1",
            clientName: "x",
            status: "DEPLOYED",
            agreedTotalCents: 799_900,
            project: null
          }
        })
      )
    ).toEqual({ siteLive: false, calculated: false, paid: false });
  });
});
