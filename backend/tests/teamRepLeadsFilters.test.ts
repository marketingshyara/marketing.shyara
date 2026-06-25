import { LeadStatus, ProspectCategory } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { buildLeadListFilters } from "../src/services/leadListFilters.js";
import { teamRepLeadsQuerySchema } from "../src/validators/schemas.js";

describe("buildLeadListFilters", () => {
  it("filters prospects by category when view=leads", () => {
    const filters = buildLeadListFilters({
      view: "leads",
      prospectCategory: ProspectCategory.INTERESTED
    });
    expect(filters).toMatchObject({
      convertedAt: null,
      prospectCategory: ProspectCategory.INTERESTED
    });
  });

  it("excludes not interested when view=leads without category", () => {
    const filters = buildLeadListFilters({ view: "leads" });
    expect(filters).toMatchObject({
      convertedAt: null,
      prospectCategory: { not: ProspectCategory.NOT_INTERESTED }
    });
  });

  it("applies legacy default when view omitted and option set", () => {
    const filters = buildLeadListFilters({}, { applyLegacyDefaultWhenNoView: true });
    expect(filters).toMatchObject({
      prospectCategory: { not: ProspectCategory.NOT_INTERESTED }
    });
  });

  it("shows all dispositions when view omitted without legacy default", () => {
    const filters = buildLeadListFilters({});
    expect(filters.prospectCategory).toBeUndefined();
    expect(filters.convertedAt).toBeUndefined();
  });

  it("filters converted clients", () => {
    const filters = buildLeadListFilters({ view: "clients" });
    expect(filters).toMatchObject({
      convertedAt: { not: null },
      status: { not: LeadStatus.COMMISSION_PAID }
    });
  });
});

describe("teamRepLeadsQuerySchema", () => {
  it("accepts prospectCategory with view=leads", () => {
    const q = teamRepLeadsQuerySchema.parse({
      page: 1,
      pageSize: 20,
      view: "leads",
      prospectCategory: ProspectCategory.NEW_LEAD
    });
    expect(q.prospectCategory).toBe(ProspectCategory.NEW_LEAD);
  });

  it("rejects prospectCategory with view=clients", () => {
    expect(() =>
      teamRepLeadsQuerySchema.parse({
        page: 1,
        pageSize: 20,
        view: "clients",
        prospectCategory: ProspectCategory.NEW_LEAD
      })
    ).toThrow();
  });
});
