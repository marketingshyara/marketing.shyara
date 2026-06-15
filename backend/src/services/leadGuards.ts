import type { Lead } from "@prisma/client";
import {
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  ProspectCategory
} from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import type { PortalSettingsValues } from "../validators/schemas.js";

/**
 * Throws when a lead is in a terminal status that forbids further mutation.
 * Callers handle their own op-specific validation (assignment, transition edges,
 * payment kind, etc.); this guard only enforces the global "do not touch terminals" rule.
 */
export function assertLeadMutable(lead: Lead, settings: PortalSettingsValues): void {
  if (
    lead.convertedAt == null &&
    lead.prospectCategory === ProspectCategory.NOT_INTERESTED
  ) {
    throw new HttpError(
      400,
      "LEAD_NOT_INTERESTED",
      "This prospect is marked not interested. Change their category before making changes."
    );
  }
  if (settings.terminalNoMutationStatuses.includes(lead.status)) {
    throw new HttpError(
      400,
      "LEAD_TERMINAL",
      "This lead is in a terminal state and cannot be changed."
    );
  }
}

export function quotedAmountCentsForPaymentKind(
  kind: PaymentKind,
  lead: Pick<Lead, "advanceAmountCents" | "finalQuoteCents">
): number | null {
  return kind === PaymentKind.ADVANCE ? lead.advanceAmountCents : lead.finalQuoteCents;
}

/** Rep-marked payment amounts must exactly match the deal split stored on the lead. */
export function assertMarkedPaymentAmountMatchesLead(
  kind: PaymentKind,
  amountCents: number,
  lead: Pick<Lead, "advanceAmountCents" | "finalQuoteCents">
): void {
  const label = kind === PaymentKind.ADVANCE ? "Advance" : "Due";
  const quoteCents = quotedAmountCentsForPaymentKind(kind, lead);
  if (quoteCents == null || quoteCents <= 0) {
    throw new HttpError(400, "INVALID_STATE", `${label} amount is not set on this deal.`);
  }
  if (amountCents !== quoteCents) {
    throw new HttpError(
      400,
      "PAYMENT_AMOUNT_MISMATCH",
      `${label} amount must match the agreed deal.`
    );
  }
}

export type LeadProspectDispositionCheck = Pick<Lead, "convertedAt" | "status"> & {
  payments: { verificationStatus: PaymentVerificationStatus }[];
  project: { id: string } | null;
};

/** Unconverted prospects with no verified payments and no project may be marked not interested. */
export function assertLeadNotInterestedEligible(lead: LeadProspectDispositionCheck): void {
  if (lead.convertedAt != null) {
    throw new HttpError(
      400,
      "LEAD_ALREADY_CONVERTED",
      "Converted clients cannot be marked not interested."
    );
  }
  if (lead.status === LeadStatus.COMMISSION_PAID) {
    throw new HttpError(400, "LEAD_TERMINAL", "This lead is complete and cannot be changed.");
  }
  if (
    lead.payments.some((p) => p.verificationStatus === PaymentVerificationStatus.VERIFIED)
  ) {
    throw new HttpError(
      400,
      "LEAD_HAS_VERIFIED_PAYMENT",
      "Cannot mark a prospect not interested after a payment has been verified."
    );
  }
  if (lead.project != null) {
    throw new HttpError(
      400,
      "LEAD_HAS_PROJECT",
      "Cannot mark a prospect not interested that already has a project."
    );
  }
}

/** Same eligibility as marking not interested — unconverted, no verified payment, no project. */
export const assertLeadDeletable = assertLeadNotInterestedEligible;
