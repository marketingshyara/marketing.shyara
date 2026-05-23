import { describe, expect, it } from "vitest";
import type { Lead, LeadPayment } from "../../types";
import {
  paymentAmountMismatchMessage,
  paymentFallbackMetaItems,
  paymentSubmissionMetaItems,
  pendingPaymentForKind,
  quotedCentsForPaymentKind,
  repPaymentWaitingDetail
} from "./paymentSubmissionMetaItems";

const baseLead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-1",
  clientName: "Acme",
  clientEmail: null,
  clientPhone: null,
  notes: null,
  status: "PREVIEW_SENT",
  advanceAmountCents: 399_950,
  finalQuoteCents: 399_950,
  agreedTotalCents: 799_900,
  websiteTemplateId: "RES/001",
  contentReceivedAt: null,
  convertedAt: "2026-01-02T00:00:00.000Z",
  whatsappGroupLink: null,
  whatsappVerifiedAt: null,
  demoFinalizedAt: null,
  demoFinalizedVerifiedAt: null,
  accountsReadyAt: null,
  accountsReadyVerifiedAt: null,
  clientGithubId: null,
  clientGithubEmail: null,
  repoTransferVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  payments: [
    {
      id: "pay-adv",
      leadId: "lead-1",
      kind: "ADVANCE",
      amountCents: 399_950,
      verificationStatus: "VERIFIED",
      repNote: "upi_id",
      markedByUserId: "rep-1",
      markedAt: "2026-01-02T00:00:00.000Z",
      verifiedByUserId: "admin-1",
      verifiedAt: "2026-01-03T00:00:00.000Z",
      adminNote: null,
      externalReference: "ref_adv"
    },
    {
      id: "pay-fin",
      leadId: "lead-1",
      kind: "FINAL",
      amountCents: 399_950,
      verificationStatus: "PENDING",
      repNote: "razorpay_payment_link",
      markedByUserId: "rep-1",
      markedAt: "2026-01-04T00:00:00.000Z",
      verifiedByUserId: null,
      verifiedAt: null,
      adminNote: null
    }
  ]
};

describe("pendingPaymentForKind", () => {
  it("returns pending payment for kind", () => {
    expect(pendingPaymentForKind(baseLead, "FINAL")?.id).toBe("pay-fin");
    expect(pendingPaymentForKind(baseLead, "ADVANCE")).toBeUndefined();
  });
});

describe("paymentAmountMismatchMessage", () => {
  it("returns null when amounts match quoted due", () => {
    const payment = baseLead.payments![1];
    expect(paymentAmountMismatchMessage(baseLead, payment)).toBeNull();
  });

  it("returns message when due amount differs from quote", () => {
    const payment = { ...baseLead.payments![1], amountCents: 1 };
    expect(paymentAmountMismatchMessage(baseLead, payment)).toMatch(/due amount/i);
  });
});

describe("paymentSubmissionMetaItems", () => {
  it("includes deal breakdown and due amount label for FINAL", () => {
    const payment = baseLead.payments![1];
    const labels = paymentSubmissionMetaItems(baseLead, payment, {
      templateLabel: "RES/001 — Demo"
    }).map((i) => i.label);

    expect(labels).toContain("Agreed total");
    expect(labels).toContain("Advance");
    expect(labels).toContain("Due amount");
    expect(labels).toContain("Payment method");
    expect(labels).toContain("Submitted at");
    expect(labels).not.toContain("Advance amount");
  });

  it("uses advance amount label for ADVANCE payment", () => {
    const payment = baseLead.payments![0];
    const labels = paymentSubmissionMetaItems(baseLead, payment).map((i) => i.label);
    expect(labels).toContain("Advance amount");
  });
});

describe("quotedCentsForPaymentKind", () => {
  it("returns final quote for FINAL", () => {
    expect(quotedCentsForPaymentKind(baseLead, "FINAL")).toBe(399_950);
  });
});

describe("paymentFallbackMetaItems", () => {
  it("shows payment rows without deal context", () => {
    const payment = baseLead.payments![1];
    const labels = paymentFallbackMetaItems(payment).map((i) => i.label);
    expect(labels).toEqual(["Due amount", "Payment method", "Submitted at"]);
    expect(labels).not.toContain("Agreed total");
  });
});

describe("repPaymentWaitingDetail", () => {
  it("uses pending payment amount when available", () => {
    expect(repPaymentWaitingDetail("final_payment", baseLead)).toMatch(
      /Due ₹3,999.50 submitted/
    );
  });

  it("returns null when stage is not payment waiting", () => {
    expect(repPaymentWaitingDetail("whatsapp_group", baseLead)).toBeNull();
  });
});
