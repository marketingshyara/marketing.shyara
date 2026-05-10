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
  it("uses verified final payment and default 20% bps", () => {
    const lead = leadStub({ finalQuoteCents: 999 });
    expect(commissionAmountCents(lead, 100_000, defaultSettings)).toBe(20_000);
    expect(commissionAmountCents(lead, 99, defaultSettings)).toBe(19);
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
