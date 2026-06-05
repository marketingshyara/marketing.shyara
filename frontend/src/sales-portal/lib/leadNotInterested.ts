import type { Lead, LeadPayment, PaymentVerificationStatus } from "../types";

type LeadNotInterestedShape = Pick<Lead, "convertedAt" | "status" | "notInterestedAt"> & {
  payments?: Pick<LeadPayment, "verificationStatus">[];
  project?: unknown | null;
};

/** Mirrors server assertLeadNotInterestedEligible for UI affordances. */
export function canMarkNotInterested(lead: LeadNotInterestedShape): boolean {
  if (lead.notInterestedAt != null) return false;
  if (lead.convertedAt != null) return false;
  if (lead.status === "COMMISSION_PAID") return false;
  if (
    lead.payments?.some((p) => p.verificationStatus === ("VERIFIED" as PaymentVerificationStatus))
  ) {
    return false;
  }
  if (lead.project != null) return false;
  return true;
}
