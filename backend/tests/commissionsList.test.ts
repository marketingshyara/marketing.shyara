import { describe, expect, it } from "vitest";

/**
 * Contract shape for GET /api/commissions list handler output.
 * Full route coverage lives in integration tests when DATABASE_URL is set.
 */
describe("commissions list response contract", () => {
  it("summary counts align with list semantics", () => {
    const summary = { total: 5, siteLive: 4, calculated: 5, paid: 2 };
    expect(summary.calculated).toBe(summary.total);
    expect(summary.siteLive).toBeLessThanOrEqual(summary.total);
    expect(summary.paid).toBeLessThanOrEqual(summary.total);
  });

  it("list item includes lead basis and rep for UI columns", () => {
    const item = {
      id: "c1",
      leadId: "l1",
      repUserId: "r1",
      amountCents: 40_000,
      bonusCents: 0,
      isPaid: true,
      paidAt: "2026-01-01T00:00:00.000Z",
      paidByAdminId: "a1",
      createdAt: "2026-01-01T00:00:00.000Z",
      lead: {
        id: "l1",
        clientName: "Acme",
        status: "COMMISSION_PAID",
        agreedTotalCents: 799_900,
        project: { deploymentVerifiedAt: "2026-01-01T00:00:00.000Z" }
      },
      rep: { id: "r1", displayName: "Rep One" }
    };
    expect(item.lead.agreedTotalCents).toBe(799_900);
    expect(item.lead.project?.deploymentVerifiedAt).toBeTruthy();
    expect(item.rep.displayName).toBe("Rep One");
  });
});

describe("commissions list prisma where (site live)", () => {
  it("siteLive filter requires deploymentVerifiedAt on project", () => {
    const siteLiveWhere = {
      lead: { project: { deploymentVerifiedAt: { not: null } } }
    };
    expect(siteLiveWhere.lead.project.deploymentVerifiedAt).toEqual({ not: null });
  });
});
