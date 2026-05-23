import { describe, expect, it } from "vitest";
import { PaymentKind } from "@prisma/client";
import { HttpError } from "../src/errors/httpError.js";
import { assertMarkedPaymentAmountMatchesLead } from "../src/services/leadGuards.js";

describe("assertMarkedPaymentAmountMatchesLead", () => {
  const lead = {
    advanceAmountCents: 399_950,
    finalQuoteCents: 399_950
  };

  it("accepts advance amount matching lead", () => {
    expect(() =>
      assertMarkedPaymentAmountMatchesLead(PaymentKind.ADVANCE, 399_950, lead)
    ).not.toThrow();
  });

  it("rejects advance amount mismatch", () => {
    expect(() =>
      assertMarkedPaymentAmountMatchesLead(PaymentKind.ADVANCE, 1, lead)
    ).toThrow(HttpError);
    try {
      assertMarkedPaymentAmountMatchesLead(PaymentKind.ADVANCE, 1, lead);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).code).toBe("PAYMENT_AMOUNT_MISMATCH");
    }
  });

  it("rejects advance when quote not set on lead", () => {
    expect(() =>
      assertMarkedPaymentAmountMatchesLead(PaymentKind.ADVANCE, 100, {
        advanceAmountCents: null,
        finalQuoteCents: 100
      })
    ).toThrow(HttpError);
    try {
      assertMarkedPaymentAmountMatchesLead(PaymentKind.ADVANCE, 100, {
        advanceAmountCents: null,
        finalQuoteCents: 100
      });
    } catch (e) {
      expect((e as HttpError).code).toBe("INVALID_STATE");
    }
  });

  it("accepts final amount matching lead", () => {
    expect(() =>
      assertMarkedPaymentAmountMatchesLead(PaymentKind.FINAL, 399_950, lead)
    ).not.toThrow();
  });

  it("rejects final amount mismatch", () => {
    try {
      assertMarkedPaymentAmountMatchesLead(PaymentKind.FINAL, 1, lead);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).code).toBe("PAYMENT_AMOUNT_MISMATCH");
    }
  });

  it("rejects final when due quote not set on lead", () => {
    try {
      assertMarkedPaymentAmountMatchesLead(PaymentKind.FINAL, 100, {
        advanceAmountCents: 100,
        finalQuoteCents: null
      });
    } catch (e) {
      expect((e as HttpError).code).toBe("INVALID_STATE");
    }
  });
});
