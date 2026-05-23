import { describe, expect, it } from "vitest";
import { paymentReferenceFieldCopy } from "./paymentShareMethods";

describe("paymentReferenceFieldCopy", () => {
  it("uses generic copy for UPI", () => {
    const copy = paymentReferenceFieldCopy("upi_id");
    expect(copy.label).toContain("Payment reference");
    expect(copy.label).not.toContain("Razorpay");
    expect(copy.placeholder).not.toContain("Razorpay");
  });

  it("uses Razorpay copy for Razorpay payment link", () => {
    const copy = paymentReferenceFieldCopy("razorpay_payment_link");
    expect(copy.label).toContain("Razorpay");
    expect(copy.hint).toContain("Razorpay");
  });

  it("uses generic copy for unknown rep note", () => {
    const copy = paymentReferenceFieldCopy("Paid via cash");
    expect(copy.verifiedLabel).toBe("Payment reference");
  });
});
