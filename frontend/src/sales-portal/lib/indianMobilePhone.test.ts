import { describe, expect, it } from "vitest";
import { createLeadSchema, patchLeadSchema } from "../validation/schemas";
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

  it("patchLeadSchema does not inject clientPhone when only previewUrl is sent", () => {
    const parsed = patchLeadSchema.parse({ previewUrl: "example.com/demo" });
    expect(parsed.previewUrl).toBe("https://example.com/demo");
    expect(parsed).not.toHaveProperty("clientPhone");
  });

  it("patchLeadSchema does not inject whatsappGroupLink when only assignedToUserId is sent", () => {
    const parsed = patchLeadSchema.parse({ assignedToUserId: "rep-1" });
    expect(parsed.assignedToUserId).toBe("rep-1");
    expect(parsed).not.toHaveProperty("whatsappGroupLink");
  });
});
