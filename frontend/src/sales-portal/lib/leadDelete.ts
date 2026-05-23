import type { Lead, LeadPayment, PaymentVerificationStatus } from "../types";

type LeadDeleteShape = Pick<Lead, "convertedAt" | "status"> & {
  payments?: Pick<LeadPayment, "verificationStatus">[];
  project?: unknown | null;
};

/** Mirrors server assertLeadDeletable for UI affordances. */
export function canDeleteProspect(lead: LeadDeleteShape): boolean {
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
