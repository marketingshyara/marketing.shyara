import { describe, expect, it } from "vitest";
import { leadsListQuerySchema } from "../src/validators/schemas.js";

describe("leadsListQuerySchema", () => {
  it("rejects from after to", () => {
    expect(() =>
      leadsListQuerySchema.parse({
        page: 1,
        pageSize: 20,
        from: new Date("2026-02-01"),
        to: new Date("2026-01-01")
      })
    ).toThrow();
  });

  it("allows from on or before to", () => {
    const q = leadsListQuerySchema.parse({
      page: 1,
      pageSize: 20,
      from: new Date("2026-01-01"),
      to: new Date("2026-02-01")
    });
    expect(q.page).toBe(1);
  });

  it("allows only from or only to", () => {
    expect(() =>
      leadsListQuerySchema.parse({ page: 1, pageSize: 20, from: new Date("2026-01-01") })
    ).not.toThrow();
    expect(() =>
      leadsListQuerySchema.parse({ page: 1, pageSize: 20, to: new Date("2026-01-01") })
    ).not.toThrow();
  });
});
