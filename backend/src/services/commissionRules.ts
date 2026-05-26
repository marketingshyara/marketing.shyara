import type { Commission, Lead } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import { divideCentsWithRounding } from "../lib/money.js";
import type { PortalSettingsValues } from "../validators/schemas.js";

export function assertAgreedTotalMeetsMinimum(
  agreedTotalCents: number | null | undefined,
  settings: PortalSettingsValues
): asserts agreedTotalCents is number {
  if (agreedTotalCents == null || agreedTotalCents < settings.minAgreedTotalCents) {
    throw new HttpError(
      400,
      "MIN_PRICE",
      `Agreed total must be at least ₹${Math.round(settings.minAgreedTotalCents / 100)}.`
    );
  }
}

export function computeCommissionAmountCents(
  lead: Pick<Lead, "agreedTotalCents">,
  settings: PortalSettingsValues
): number {
  const base = lead.agreedTotalCents;
  if (base == null || base < 0) {
    throw new HttpError(
      400,
      "COMMISSION_BASE_MISSING",
      "Lead is missing agreedTotalCents; set the agreed total before computing commission."
    );
  }
  return divideCentsWithRounding(
    base * settings.commissionRateBps,
    10000,
    settings.commissionRounding
  );
}

export function expectedCommissionAmountCents(
  lead: Pick<Lead, "agreedTotalCents">,
  settings: PortalSettingsValues
): number | null {
  if (lead.agreedTotalCents == null || lead.agreedTotalCents < 0) {
    return null;
  }
  try {
    return computeCommissionAmountCents(lead, settings);
  } catch {
    return null;
  }
}

export function commissionIntegrityIssues(
  lead: Pick<Lead, "agreedTotalCents">,
  commission: Pick<Commission, "amountCents">,
  settings: PortalSettingsValues
): string[] {
  const issues: string[] = [];
  const base = lead.agreedTotalCents;
  const minCommission = divideCentsWithRounding(
    settings.minAgreedTotalCents * settings.commissionRateBps,
    10000,
    settings.commissionRounding
  );

  if (base == null) {
    issues.push("Deal amount is missing on this lead.");
  } else if (base < settings.minAgreedTotalCents) {
    issues.push(
      `Deal amount is below the portal minimum (₹${Math.round(settings.minAgreedTotalCents / 100)}).`
    );
  }

  const expected = expectedCommissionAmountCents(lead, settings);
  if (expected != null && commission.amountCents !== expected) {
    issues.push(
      `Commission amount does not match ${(settings.commissionRateBps / 100).toFixed(2)}% of the agreed deal total (expected ₹${(expected / 100).toFixed(2)}).`
    );
  }

  if (commission.amountCents < minCommission) {
    issues.push(
      `Commission is below the minimum expected for current portal rate and minimum deal (₹${(minCommission / 100).toFixed(2)}).`
    );
  }

  return issues;
}

export function assertCommissionPayable(
  lead: Pick<Lead, "agreedTotalCents">,
  commission: Pick<Commission, "amountCents" | "isPaid">,
  settings: PortalSettingsValues
): void {
  if (commission.isPaid) {
    return;
  }
  assertAgreedTotalMeetsMinimum(lead.agreedTotalCents, settings);
  const issues = commissionIntegrityIssues(lead, commission, settings);
  if (issues.length > 0) {
    throw new HttpError(
      400,
      "COMMISSION_INVALID",
      issues.join(" ")
    );
  }
}
