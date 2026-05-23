import type { Lead, PortalSettingsValues } from "../types";
import { bpsToPercentLabel, estimateCommissionCents, formatMinorUnits } from "./money";

export function commissionBasisLabel(): string {
  return "Agreed project total";
}

export function commissionBaseCents(lead: Lead): number | null {
  const base = lead.agreedTotalCents;
  if (base == null || base < 0) return null;
  return base;
}

export function estimatedCommissionForLead(
  lead: Lead,
  settings: PortalSettingsValues
): number | null {
  const base = commissionBaseCents(lead);
  if (base == null) return null;
  return estimateCommissionCents(base, settings.commissionRateBps, settings.commissionRounding);
}

export function commissionRateLabel(settings: PortalSettingsValues): string {
  return bpsToPercentLabel(settings.commissionRateBps);
}

export function commissionBreakdownHint(
  lead: Lead,
  settings: PortalSettingsValues
): string | null {
  const base = commissionBaseCents(lead);
  if (base == null) return null;
  return `${commissionRateLabel(settings)} of ${formatMinorUnits(base)} agreed total`;
}
