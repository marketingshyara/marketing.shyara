import type { Lead } from "@prisma/client";
import { LeadStatus, UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { assertManualTransition, commissionAmountCents } from "../src/services/leadFsm.js";
import { HttpError } from "../src/errors/httpError.js";
import { portalSettingsSchema } from "../src/validators/schemas.js";

const defaultSettings = portalSettingsSchema.parse({});

function leadStub(partial: Partial<Lead>): Lead {
  return partial as Lead;
}

describe("commissionAmountCents", () => {
  it("uses agreed total and default 20% bps (bankers rounding)", () => {
    const lead = leadStub({ agreedTotalCents: 100_000 });
    expect(commissionAmountCents(lead, 50_000, defaultSettings)).toBe(20_000);
    const leadSmall = leadStub({ agreedTotalCents: 99 });
    expect(commissionAmountCents(leadSmall, 99, defaultSettings)).toBe(20);
  });

  it("ignores verified final payment amount (always agreed total)", () => {
    const lead = leadStub({ agreedTotalCents: 799_900 });
    expect(commissionAmountCents(lead, 399_950, defaultSettings)).toBe(159_980);
  });

  it("respects floor rounding when configured", () => {
    const settings = portalSettingsSchema.parse({ commissionRounding: "floor" });
    const lead = leadStub({ agreedTotalCents: 99 });
    expect(commissionAmountCents(lead, 99, settings)).toBe(19);
  });

  it("rounds exact halves to even with bankers", () => {
    const lead = leadStub({ agreedTotalCents: 5 });
    const settings = portalSettingsSchema.parse({ commissionRateBps: 1000 });
    expect(commissionAmountCents(lead, 0, settings)).toBe(0);
    const lead2 = leadStub({ agreedTotalCents: 15 });
    expect(commissionAmountCents(lead2, 0, settings)).toBe(2);
  });

  it("throws when agreed total missing", () => {
    const lead = leadStub({ agreedTotalCents: null });
    expect(() => commissionAmountCents(lead, 100_000, defaultSettings)).toThrow(HttpError);
  });
});

describe("assertManualTransition", () => {
  it("allows rep to move ADVANCE_PAID to BUILDING", () => {
    expect(() =>
      assertManualTransition(
        defaultSettings,
        LeadStatus.ADVANCE_PAID,
        LeadStatus.BUILDING,
        UserRole.SALES_REP
      )
    ).not.toThrow();
  });

  it("allows admin FINAL_PAID to DEPLOYED", () => {
    expect(() =>
      assertManualTransition(
        defaultSettings,
        LeadStatus.FINAL_PAID,
        LeadStatus.DEPLOYED,
        UserRole.ADMIN
      )
    ).not.toThrow();
  });

  it("blocks rep from FINAL_PAID to DEPLOYED", () => {
    expect(() =>
      assertManualTransition(
        defaultSettings,
        LeadStatus.FINAL_PAID,
        LeadStatus.DEPLOYED,
        UserRole.SALES_REP
      )
    ).toThrow(HttpError);
  });

  it("blocks rep from BUILDING to PREVIEW_SENT (admin-only edge by default)", () => {
    expect(() =>
      assertManualTransition(
        defaultSettings,
        LeadStatus.BUILDING,
        LeadStatus.PREVIEW_SENT,
        UserRole.SALES_REP
      )
    ).toThrow(HttpError);
  });

  it("allows admin to move BUILDING to PREVIEW_SENT", () => {
    expect(() =>
      assertManualTransition(
        defaultSettings,
        LeadStatus.BUILDING,
        LeadStatus.PREVIEW_SENT,
        UserRole.ADMIN
      )
    ).not.toThrow();
  });

  it("rejects invalid edges", () => {
    expect(() =>
      assertManualTransition(defaultSettings, LeadStatus.NEW, LeadStatus.BUILDING, UserRole.ADMIN)
    ).toThrow(HttpError);
  });

  it("rejects when edge disabled in settings", () => {
    const settings = portalSettingsSchema.parse({
      manualTransitions: [
        {
          from: LeadStatus.ADVANCE_PAID,
          to: LeadStatus.BUILDING,
          adminOnly: false,
          enabled: false
        }
      ]
    });
    expect(() =>
      assertManualTransition(
        settings,
        LeadStatus.ADVANCE_PAID,
        LeadStatus.BUILDING,
        UserRole.SALES_REP
      )
    ).toThrow(HttpError);
  });
});
