import { describe, expect, it } from "vitest";
import type { Lead } from "../types";
import { defaultPaymentShareMethods } from "./paymentShareMethods";
import {
  estimatedCommissionForLead,
  estimatedPerformanceBonusCents,
  performanceBonusProgramHint
} from "./commissionEstimate";

const lead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-1",
  clientName: "Acme",
  clientEmail: null,
  clientPhone: null,
  notes: null,
  status: "DEPLOYED",
  advanceAmountCents: 399_950,
  finalQuoteCents: 399_950,
  agreedTotalCents: 799_900,
  websiteTemplateId: null,
  contentReceivedAt: null,
  convertedAt: "2026-01-01T00:00:00.000Z",
  whatsappGroupLink: null,
  whatsappVerifiedAt: null,
  demoFinalizedAt: null,
  demoFinalizedVerifiedAt: null,
  accountsReadyAt: null,
  accountsReadyVerifiedAt: null,
  clientGithubId: null,
  clientGithubEmail: null,
  transferredGithubRepoUrl: null,
  repoTransferVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  payments: [
    {
      id: "pay-fin",
      leadId: "lead-1",
      kind: "FINAL",
      amountCents: 399_950,
      verificationStatus: "VERIFIED",
      repNote: null,
      markedByUserId: "rep-1",
      markedAt: "2026-01-02T00:00:00.000Z",
      verifiedByUserId: "admin-1",
      verifiedAt: "2026-01-03T00:00:00.000Z",
      adminNote: null
    }
  ]
};

describe("estimatedCommissionForLead", () => {
  it("uses agreed total not verified due payment", () => {
    const cents = estimatedCommissionForLead(lead, {
      commissionRateBps: 2000,
      commissionRounding: "round",
      commissionBasis: "VERIFIED_FINAL_PAYMENT",
      minAgreedTotalCents: 0,
      advancePaymentShareBps: 5000,
      manualTransitions: [],
      advancePaymentRequiredLeadStatus: "NEW",
      finalPaymentRequiredLeadStatus: "BUILDING",
      advanceVerifyRequiredLeadStatus: "NEW",
      finalVerifyRequiredLeadStatus: "BUILDING",
      terminalNoMutationStatuses: ["COMMISSION_PAID"],
      enforcePaymentQuoteToleranceBps: null,
      exportMaxRows: 5000,
      performanceBonusBps: 0,
      performanceBonusAfterCompletedSales: 3,
      templatesCatalogUrl: "https://example.com",
      tutorialLinks: [],
      painPointsByCategory: [],
      paymentShareMethods: defaultPaymentShareMethods()
    });
    expect(cents).toBe(159_980);
  });
});

describe("estimatedPerformanceBonusCents", () => {
  const settings = {
    commissionRateBps: 2000,
    commissionRounding: "round" as const,
    commissionBasis: "AGREED_TOTAL" as const,
    minAgreedTotalCents: 0,
    advancePaymentShareBps: 5000,
    manualTransitions: [],
    advancePaymentRequiredLeadStatus: "NEW" as const,
    finalPaymentRequiredLeadStatus: "BUILDING" as const,
    advanceVerifyRequiredLeadStatus: "NEW" as const,
    finalVerifyRequiredLeadStatus: "BUILDING" as const,
    terminalNoMutationStatuses: ["COMMISSION_PAID" as const],
    enforcePaymentQuoteToleranceBps: null,
    exportMaxRows: 5000,
    performanceBonusBps: 500,
    performanceBonusAfterCompletedSales: 10,
    templatesCatalogUrl: "https://example.com",
    tutorialLinks: [],
    painPointsByCategory: [],
    paymentShareMethods: defaultPaymentShareMethods()
  };

  it("is 5% of agreed total", () => {
    expect(estimatedPerformanceBonusCents(lead, settings)).toBe(39_995);
  });

  it("program hint describes percent of agreed total", () => {
    expect(performanceBonusProgramHint(settings)).toContain("5%");
    expect(performanceBonusProgramHint(settings)).toContain("sale #11");
  });
});
