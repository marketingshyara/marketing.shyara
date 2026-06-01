import type { Lead, PortalSettingsValues, RepPortalSettings } from "../types";
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

type BonusDisplaySettings = Pick<
  PortalSettingsValues,
  "performanceBonusBps" | "performanceBonusAfterCompletedSales" | "commissionRounding"
>;

export function commissionBreakdownHint(
  lead: Lead,
  settings: Pick<PortalSettingsValues, "commissionRateBps"> | RepPortalSettings
): string | null {
  const base = commissionBaseCents(lead);
  if (base == null) return null;
  return `${commissionRateLabel(settings)} of ${formatMinorUnits(base)} agreed total`;
}

export function performanceBonusRateLabel(
  settings: Pick<PortalSettingsValues, "performanceBonusBps">
): string {
  return bpsToPercentLabel(settings.performanceBonusBps);
}

export function estimatedPerformanceBonusCents(
  lead: Lead,
  settings: BonusDisplaySettings
): number | null {
  const base = commissionBaseCents(lead);
  if (base == null || settings.performanceBonusBps === 0) return null;
  return estimateCommissionCents(
    base,
    settings.performanceBonusBps,
    settings.commissionRounding
  );
}

/** Admin copy when commission is not yet paid (threshold is rep-wide; exact eligibility checked on mark-paid). */
/** Rep-facing summary of the performance bonus program (read-only). */
export function performanceBonusProgramHint(settings: BonusDisplaySettings): string | null {
  if (settings.performanceBonusBps === 0) return null;
  const threshold = settings.performanceBonusAfterCompletedSales;
  const fromSale = threshold + 1;
  return `Performance bonus: extra ${performanceBonusRateLabel(settings)} of the agreed project total on eligible deals (from sale #${fromSale} after ${threshold} paid sale(s)).`;
}

export function performanceBonusPayoutHint(
  lead: Lead,
  settings: BonusDisplaySettings
): string | null {
  const bonus = estimatedPerformanceBonusCents(lead, settings);
  if (bonus == null || bonus === 0) return null;
  const threshold = settings.performanceBonusAfterCompletedSales;
  const fromSale = threshold + 1;
  return `Performance bonus (${performanceBonusRateLabel(settings)} of agreed total): +${formatMinorUnits(bonus)} when this rep already has ${threshold} paid sale(s) (from sale #${fromSale} onward).`;
}

export function formatPerformanceBonusSuffix(
  bonusCents: number,
  settings: Pick<PortalSettingsValues, "performanceBonusBps"> | null | undefined
): string {
  if (bonusCents <= 0) return "";
  const rate =
    settings && settings.performanceBonusBps > 0
      ? ` (${performanceBonusRateLabel(settings)})`
      : "";
  return ` + ${formatMinorUnits(bonusCents)} bonus${rate}`;
}
