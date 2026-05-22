import { describe, expect, it } from "vitest";
import { createLeadSchema } from "../validation/schemas";
import { normalizeIndianMobileInput } from "./indianMobilePhone";

describe("indianMobilePhone (frontend)", () => {
  it("normalizes pasted numbers with spaces", () => {
    expect(normalizeIndianMobileInput("98 7654 3210")).toBe("9876543210");
  });

  it("createLeadSchema requires valid mobile", () => {
    expect(() =>
      createLeadSchema.parse({
        clientName: "Test",
        clientPhone: "hello",
        clientEmail: ""
      })
    ).toThrow();
    const parsed = createLeadSchema.parse({
      clientName: "Test",
      clientPhone: "9876543210",
      clientEmail: "",
      notes: ""
    });
    expect(parsed.clientPhone).toBe("9876543210");
  });
});
