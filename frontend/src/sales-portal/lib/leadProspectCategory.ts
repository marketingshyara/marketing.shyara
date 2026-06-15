import type { Lead, LeadPayment, PaymentVerificationStatus, ProspectCategory } from "../types";

export const PROSPECT_CATEGORIES = [
  "NEW_LEAD",
  "CALLBACK_REQUESTED",
  "NO_ANSWER",
  "INTERESTED",
  "FOLLOW_UP",
  "NOT_INTERESTED"
] as const satisfies readonly ProspectCategory[];

type LeadProspectShape = Pick<
  Lead,
  "convertedAt" | "status" | "prospectCategory" | "interestedSampleShared"
> & {
  payments?: Pick<LeadPayment, "verificationStatus">[];
  project?: unknown | null;
};

const LABELS: Record<ProspectCategory, string> = {
  NEW_LEAD: "New lead",
  CALLBACK_REQUESTED: "Callback requested",
  NO_ANSWER: "No answer",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow up",
  NOT_INTERESTED: "Not interested"
};

const SHORT_LABELS: Record<ProspectCategory, string> = {
  NEW_LEAD: "New",
  CALLBACK_REQUESTED: "Callback",
  NO_ANSWER: "No answer",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow up",
  NOT_INTERESTED: "Not interested"
};

export function prospectCategoryLabel(category: ProspectCategory): string {
  return LABELS[category];
}

export function prospectCategoryShortLabel(category: ProspectCategory): string {
  return SHORT_LABELS[category];
}

export function isProspectArchived(lead: Pick<Lead, "convertedAt" | "prospectCategory">): boolean {
  return lead.convertedAt == null && lead.prospectCategory === "NOT_INTERESTED";
}

/** Mirrors server assertLeadNotInterestedEligible for NOT_INTERESTED transitions. */
export function canMarkNotInterested(lead: LeadProspectShape): boolean {
  if (lead.prospectCategory === "NOT_INTERESTED") return false;
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

/** Mirrors server assertLeadDeletable — same rules as not-interested eligibility. */
export const canDeleteLead = canMarkNotInterested;

export function canChangeProspectCategory(lead: LeadProspectShape): boolean {
  if (lead.convertedAt != null) return false;
  if (lead.status === "COMMISSION_PAID") return false;
  return true;
}

export function interestedSampleLabel(shared: boolean | null | undefined): string {
  if (shared === true) return "Sample shared";
  if (shared === false) return "Sample pending";
  return "Sample status unknown";
}

export function prospectCategoryEventDetail(category: ProspectCategory, event: {
  callbackAt?: string | null;
  sampleShared?: boolean | null;
  note?: string | null;
}): string | null {
  if (category === "CALLBACK_REQUESTED" && event.callbackAt) {
    return `Callback ${new Date(event.callbackAt).toLocaleString()}`;
  }
  if (category === "INTERESTED" && event.sampleShared != null) {
    return interestedSampleLabel(event.sampleShared);
  }
  if (category === "NOT_INTERESTED" && event.note) {
    return event.note;
  }
  if (event.note) return event.note;
  return null;
}
