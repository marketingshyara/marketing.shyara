import { describe, expect, it } from "vitest";
import {
  isValidIndianMobile,
  indianMobilePhoneSchema,
  normalizeIndianMobileInput
} from "../src/lib/indianMobilePhone.js";
import { createLeadBodySchema } from "../src/validators/schemas.js";

describe("indianMobilePhone", () => {
  it("strips non-digits and caps at 10", () => {
    expect(normalizeIndianMobileInput("+91 98765-43210 extra")).toBe("9876543210");
  });

  it("accepts valid 10-digit mobile", () => {
    expect(indianMobilePhoneSchema.parse("9876543210")).toBe("9876543210");
    expect(isValidIndianMobile("9876543210")).toBe(true);
  });

  it("rejects text and short numbers", () => {
    expect(() => indianMobilePhoneSchema.parse("abcdefghi")).toThrow(/10-digit/i);
    expect(() => indianMobilePhoneSchema.parse("12345")).toThrow(/10-digit/i);
  });

  it("rejects invalid leading digit", () => {
    expect(() => indianMobilePhoneSchema.parse("5876543210")).toThrow(/valid Indian mobile/i);
  });

  it("requires phone on create lead", () => {
    expect(() =>
      createLeadBodySchema.parse({
        clientName: "Acme",
        clientEmail: ""
      })
    ).toThrow();
    const body = createLeadBodySchema.parse({
      clientName: "Acme",
      clientPhone: "9123456789",
      clientEmail: ""
    });
    expect(body.clientPhone).toBe("9123456789");
  });
});
