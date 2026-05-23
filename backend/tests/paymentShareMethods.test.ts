import { describe, expect, it } from "vitest";
import {
  convertLeadBodySchema,
  markPaymentBodySchema,
  parsePortalSettings
} from "../src/validators/schemas.js";
import {
  PAYMENT_SHARE_METHOD_KEYS,
  defaultPaymentShareMethods
} from "../src/data/paymentShareMethods.js";

describe("payment share method validation", () => {
  it("convert requires a valid payment method key in repNote", () => {
    expect(
      convertLeadBodySchema.safeParse({
        websiteTemplateId: "RES/001",
        agreedTotalCents: 799_900
      }).success
    ).toBe(false);

    expect(
      convertLeadBodySchema.safeParse({
        websiteTemplateId: "RES/001",
        agreedTotalCents: 799_900,
        repNote: "cash"
      }).success
    ).toBe(false);

    expect(
      convertLeadBodySchema.safeParse({
        websiteTemplateId: "RES/001",
        agreedTotalCents: 799_900,
        repNote: "upi_id"
      }).success
    ).toBe(true);
  });

  it("mark payment requires a valid payment method key in repNote", () => {
    expect(
      markPaymentBodySchema.safeParse({
        kind: "FINAL",
        amountCents: 399_950
      }).success
    ).toBe(false);

    expect(
      markPaymentBodySchema.safeParse({
        kind: "FINAL",
        amountCents: 399_950,
        repNote: "razorpay_payment_link"
      }).success
    ).toBe(true);
  });
});

describe("parsePortalSettings paymentShareMethods", () => {
  it("defaults to five methods in display order", () => {
    const settings = parsePortalSettings({});
    expect(settings.paymentShareMethods).toHaveLength(5);
    expect(settings.paymentShareMethods.map((m) => m.key)).toEqual([...PAYMENT_SHARE_METHOD_KEYS]);
    expect(settings.paymentShareMethods.every((m) => m.shareValue === "")).toBe(true);
  });

  it("merges stored configs with catalog defaults", () => {
    const defaults = defaultPaymentShareMethods();
    const settings = parsePortalSettings({
      paymentShareMethods: [
        { key: "upi_id", shareValue: "pay@shyara", qrImageUrl: null, instructions: "Use GPay" }
      ]
    });
    expect(settings.paymentShareMethods[0].shareValue).toBe("pay@shyara");
    expect(settings.paymentShareMethods[0].instructions).toBe("Use GPay");
    expect(settings.paymentShareMethods[1].key).toBe(defaults[1].key);
  });
});
