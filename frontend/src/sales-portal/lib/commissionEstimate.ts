import type { Lead, PortalSettingsValues } from "../types";
import { bpsToPercentLabel, estimateCommissionCents } from "./money";

export function commissionBasisLabel(basis: PortalSettingsValues["commissionBasis"]): string {
  switch (basis) {
    case "AGREED_TOTAL":
      return "Agreed project total";
    case "FINAL_QUOTE":
      return "Due (final quote)";
    default:
      return "Verified due payment";
  }
}

export function commissionBaseCents(
  lead: Lead,
  settings: PortalSettingsValues
): number | null {
  if (settings.commissionBasis === "AGREED_TOTAL") {
    return lead.agreedTotalCents;
  }
  if (settings.commissionBasis === "FINAL_QUOTE") {
    return lead.finalQuoteCents;
  }
  const verifiedFinal = lead.payments?.find(
    (p) => p.kind === "FINAL" && p.verificationStatus === "VERIFIED"
  );
  return verifiedFinal?.amountCents ?? null;
}

export function estimatedCommissionForLead(
  lead: Lead,
  settings: PortalSettingsValues
): number | null {
  const base = commissionBaseCents(lead, settings);
  if (base == null || base < 0) return null;
  return estimateCommissionCents(base, settings.commissionRateBps, settings.commissionRounding);
}

export function commissionRateLabel(settings: PortalSettingsValues): string {
  return bpsToPercentLabel(settings.commissionRateBps);
}
