import { describe, expect, it } from "vitest";
import { createLeadBodySchema, patchLeadBodySchema } from "../src/validators/schemas.js";

describe("optionalLeadEmail (create/patch)", () => {
  it("maps empty string clientEmail to null on create", () => {
    const body = createLeadBodySchema.parse({
      clientName: "Acme",
      clientPhone: "9876543210",
      clientEmail: ""
    });
    expect(body.clientEmail).toBeNull();
  });

  it("maps empty string clientEmail on patch", () => {
    const body = patchLeadBodySchema.parse({ clientEmail: "" });
    expect(body.clientEmail).toBeNull();
  });

  it("does not inject clientEmail when only previewUrl is sent", () => {
    const body = patchLeadBodySchema.parse({ previewUrl: "example.com" });
    expect(body.previewUrl).toBe("https://example.com/");
    expect(body).not.toHaveProperty("clientEmail");
  });
});
