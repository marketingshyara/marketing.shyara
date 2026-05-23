import type { Lead } from "@prisma/client";
import { PaymentKind } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import type { PortalSettingsValues } from "../validators/schemas.js";

/**
 * Throws when a lead is in a terminal status that forbids further mutation.
 * Callers handle their own op-specific validation (assignment, transition edges,
 * payment kind, etc.); this guard only enforces the global "do not touch terminals" rule.
 */
export function assertLeadMutable(lead: Lead, settings: PortalSettingsValues): void {
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
