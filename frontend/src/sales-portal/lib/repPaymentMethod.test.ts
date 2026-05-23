import { describe, expect, it } from "vitest";
import type { Lead } from "../types";
import { repPaymentMethodFromLead } from "./repPaymentMethod";

const baseLead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-1",
  clientName: "Acme",
  clientEmail: null,
  clientPhone: null,
  notes: null,
  status: "NEW",
  advanceAmountCents: null,
  finalQuoteCents: null,
  agreedTotalCents: null,
  websiteTemplateId: null,
  contentReceivedAt: null,
  convertedAt: null,
  whatsappGroupLink: null,
  whatsappVerifiedAt: null,
  demoFinalizedAt: null,
  demoFinalizedVerifiedAt: null,
  accountsReadyAt: null,
  accountsReadyVerifiedAt: null,
  repoTransferVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  payments: []
};

describe("repPaymentMethodFromLead", () => {
  it("returns pending payment method key", () => {
    expect(
      repPaymentMethodFromLead(
        {
          ...baseLead,
          payments: [
            {
              id: "p1",
              leadId: "lead-1",
              kind: "ADVANCE",
              amountCents: 1000,
              repNote: "razorpay_qr",
              markedByUserId: "rep-1",
              markedAt: "2026-01-02T00:00:00.000Z",
              verificationStatus: "PENDING",
              verifiedByUserId: null,
              verifiedAt: null,
              adminNote: null
            }
          ]
        },
        "ADVANCE"
      )
    ).toBe("razorpay_qr");
  });

  it("falls back to latest rejected payment method", () => {
    expect(
      repPaymentMethodFromLead(
        {
          ...baseLead,
          payments: [
            {
              id: "p-old",
              leadId: "lead-1",
              kind: "FINAL",
              amountCents: 1000,
              repNote: "upi_id",
              markedByUserId: "rep-1",
              markedAt: "2026-01-01T00:00:00.000Z",
              verificationStatus: "REJECTED",
              verifiedByUserId: null,
              verifiedAt: "2026-01-02T00:00:00.000Z",
              adminNote: "bad ref"
            },
            {
              id: "p-new",
              leadId: "lead-1",
              kind: "FINAL",
              amountCents: 1000,
              repNote: "razorpay_payment_link",
              markedByUserId: "rep-1",
              markedAt: "2026-01-03T00:00:00.000Z",
              verificationStatus: "REJECTED",
              verifiedByUserId: null,
              verifiedAt: "2026-01-04T00:00:00.000Z",
              adminNote: "bad ref"
            }
          ]
        },
        "FINAL"
      )
    ).toBe("razorpay_payment_link");
  });

  it("returns empty string when no matching payment", () => {
    expect(repPaymentMethodFromLead(baseLead, "ADVANCE")).toBe("");
  });
});
