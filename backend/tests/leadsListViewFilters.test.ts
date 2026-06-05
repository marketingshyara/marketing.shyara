import { LeadStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { leadsListQuerySchema } from "../src/validators/schemas.js";

describe("leadsListQuerySchema view filters", () => {
  it("accepts view=completed", () => {
    const q = leadsListQuerySchema.parse({ page: 1, pageSize: 20, view: "completed" });
    expect(q.view).toBe("completed");
  });

  it("accepts view=not_interested", () => {
    const q = leadsListQuerySchema.parse({ page: 1, pageSize: 20, view: "not_interested" });
    expect(q.view).toBe("not_interested");
  });

  it("rejects status with view=not_interested", () => {
    expect(() =>
      leadsListQuerySchema.parse({
        page: 1,
        pageSize: 20,
        view: "not_interested",
        status: LeadStatus.BUILDING
      })
    ).toThrow();
  });

  it("rejects status with view=clients", () => {
    expect(() =>
      leadsListQuerySchema.parse({
        page: 1,
        pageSize: 20,
        view: "clients",
        status: LeadStatus.DEPLOYED
      })
    ).toThrow();
  });

  it("allows status with view=leads or no view", () => {
    expect(() =>
      leadsListQuerySchema.parse({
        page: 1,
        pageSize: 20,
        view: "leads",
        status: LeadStatus.BUILDING
      })
    ).not.toThrow();
    expect(() =>
      leadsListQuerySchema.parse({
        page: 1,
        pageSize: 20,
        status: LeadStatus.BUILDING
      })
    ).not.toThrow();
  });
});
