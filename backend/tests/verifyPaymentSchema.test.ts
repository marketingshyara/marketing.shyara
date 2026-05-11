import { describe, expect, it } from "vitest";
import { verifyPaymentBodySchema } from "../src/validators/schemas.js";

describe("verifyPaymentBodySchema", () => {
  it("requires externalReference when VERIFIED", () => {
    const r = verifyPaymentBodySchema.safeParse({ decision: "VERIFIED" });
    expect(r.success).toBe(false);
  });

  it("parses VERIFIED with reference", () => {
    const r = verifyPaymentBodySchema.safeParse({
      decision: "VERIFIED",
      externalReference: "  pay_abc123  "
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.decision).toBe("VERIFIED");
      expect(r.data.externalReference).toBe("pay_abc123");
    }
  });

  it("parses REJECTED without reference", () => {
    const r = verifyPaymentBodySchema.safeParse({ decision: "REJECTED" });
    expect(r.success).toBe(true);
  });
});
