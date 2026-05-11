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
  it("uses verified final payment and default 20% bps (bankers rounding)", () => {
    const lead = leadStub({ finalQuoteCents: 999 });
    expect(commissionAmountCents(lead, 100_000, defaultSettings)).toBe(20_000);
    // 99c * 20% = 19.8c -> rounds up to 20 with bankers (closer to 20 than 19).
    expect(commissionAmountCents(lead, 99, defaultSettings)).toBe(20);
  });

  it("respects floor rounding when configured", () => {
    const settings = portalSettingsSchema.parse({ commissionRounding: "floor" });
    const lead = leadStub({ finalQuoteCents: 999 });
    expect(commissionAmountCents(lead, 99, settings)).toBe(19);
  });

  it("rounds exact halves to even with bankers", () => {
    // 5c * 1000bps = 5000 / 10000 = 0.5 -> bankers picks 0 (even).
    const lead = leadStub({ finalQuoteCents: null });
    const settings = portalSettingsSchema.parse({ commissionRateBps: 1000 });
    expect(commissionAmountCents(lead, 5, settings)).toBe(0);
    // 15c * 1000bps = 15000 / 10000 = 1.5 -> bankers picks 2 (even).
    expect(commissionAmountCents(lead, 15, settings)).toBe(2);
  });

  it("uses final quote when commissionBasis is FINAL_QUOTE", () => {
    const settings = portalSettingsSchema.parse({
      commissionBasis: "FINAL_QUOTE",
      commissionRateBps: 1500
    });
    const lead = leadStub({ finalQuoteCents: 100_000 });
    expect(commissionAmountCents(lead, 50_000, settings)).toBe(15_000);
  });

  it("throws when FINAL_QUOTE basis but quote missing", () => {
    const settings = portalSettingsSchema.parse({ commissionBasis: "FINAL_QUOTE" });
    const lead = leadStub({ finalQuoteCents: null });
    expect(() => commissionAmountCents(lead, 100_000, settings)).toThrow(HttpError);
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
