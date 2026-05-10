import type { Lead } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getCommissionRepUserId } from "../src/services/commissionRep.js";

function leadStub(partial: Partial<Lead>): Lead {
  return partial as Lead;
}

describe("getCommissionRepUserId", () => {
  it("prefers assignedToUserId over creator", () => {
    expect(
      getCommissionRepUserId(
        leadStub({ assignedToUserId: "rep-1", createdByUserId: "admin-1" })
      )
    ).toBe("rep-1");
  });

  it("falls back to createdByUserId when unassigned", () => {
    expect(
      getCommissionRepUserId(leadStub({ assignedToUserId: null, createdByUserId: "rep-2" }))
    ).toBe("rep-2");
  });
});
