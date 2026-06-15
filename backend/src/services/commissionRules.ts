import type { Commission, Lead } from "@prisma/client";
import { CommissionModel } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import { divideCentsWithRounding } from "../lib/money.js";
import type { PortalSettingsValues } from "../validators/schemas.js";
import { MODEL_B_MILESTONE_AMOUNT_CENTS, MODEL_B_MILESTONE_TARGET, MODEL_B_PER_DEAL_AFTER_CENTS } from "./commissionModel.js";

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

export function repQualifiesForPerformanceBonus(
  paidCommissionCount: number,
  settings: PortalSettingsValues
): boolean {
  return paidCommissionCount >= settings.performanceBonusAfterCompletedSales;
}

export function computePerformanceBonusCents(
  lead: Pick<Lead, "agreedTotalCents">,
  settings: PortalSettingsValues
): number {
  const base = lead.agreedTotalCents;
  if (base == null || base < 0) {
    throw new HttpError(
      400,
      "COMMISSION_BASE_MISSING",
      "Lead is missing agreedTotalCents; set the agreed total before computing performance bonus."
    );
  }
  if (settings.performanceBonusBps === 0) {
    return 0;
  }
  return divideCentsWithRounding(
    base * settings.performanceBonusBps,
    10000,
    settings.commissionRounding
  );
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

export function expectedCommissionAmountCentsForModel(
  lead: Pick<Lead, "agreedTotalCents">,
  settings: PortalSettingsValues,
  model: CommissionModel,
  deployedOrdinal: number | null
): number | null {
  if (model === CommissionModel.MODEL_B) {
    if (deployedOrdinal == null || deployedOrdinal < MODEL_B_MILESTONE_TARGET) return null;
    if (deployedOrdinal === MODEL_B_MILESTONE_TARGET) return MODEL_B_MILESTONE_AMOUNT_CENTS;
    return MODEL_B_PER_DEAL_AFTER_CENTS;
  }
  return expectedCommissionAmountCents(lead, settings);
}

export function commissionIntegrityIssuesForModel(
  lead: Pick<Lead, "agreedTotalCents">,
  commission: Pick<Commission, "amountCents">,
  settings: PortalSettingsValues,
  model: CommissionModel,
  deployedOrdinal: number | null
): string[] {
  if (model === CommissionModel.MODEL_B) {
    const issues: string[] = [];
    if (
      deployedOrdinal === MODEL_B_MILESTONE_TARGET &&
      commission.amountCents === MODEL_B_MILESTONE_AMOUNT_CENTS
    ) {
      return issues;
    }
    if (deployedOrdinal == null || deployedOrdinal <= MODEL_B_MILESTONE_TARGET) {
      issues.push("Commission row is unexpected for this Model B deployment ordinal.");
      return issues;
    }
    if (commission.amountCents !== MODEL_B_PER_DEAL_AFTER_CENTS) {
      issues.push(
        `Payout amount does not match the Model B fixed rate (expected ₹${(MODEL_B_PER_DEAL_AFTER_CENTS / 100).toFixed(0)}).`
      );
    }
    return issues;
  }
  return commissionIntegrityIssues(lead, commission, settings);
}

/** Model B rep may still have commission rows created under Model A before conversion. */
export function isLegacyModelACommissionRow(
  repModel: CommissionModel,
  lead: Pick<Lead, "agreedTotalCents">,
  commission: Pick<Commission, "amountCents">,
  settings: PortalSettingsValues,
  deployedOrdinal: number | null
): boolean {
  if (repModel !== CommissionModel.MODEL_B) return false;
  if (commission.amountCents === MODEL_B_MILESTONE_AMOUNT_CENTS) return false;
  if (
    commission.amountCents === MODEL_B_PER_DEAL_AFTER_CENTS &&
    deployedOrdinal != null &&
    deployedOrdinal > MODEL_B_MILESTONE_TARGET
  ) {
    return false;
  }
  const expectedA = expectedCommissionAmountCents(lead, settings);
  if (expectedA != null && commission.amountCents === expectedA) return true;
  return deployedOrdinal != null && deployedOrdinal <= MODEL_B_MILESTONE_TARGET;
}

export function resolveEffectiveCommissionRowModel(
  repModel: CommissionModel,
  lead: Pick<Lead, "agreedTotalCents">,
  commission: Pick<Commission, "amountCents">,
  settings: PortalSettingsValues,
  deployedOrdinal: number | null
): CommissionModel {
  if (isLegacyModelACommissionRow(repModel, lead, commission, settings, deployedOrdinal)) {
    return CommissionModel.MODEL_A;
  }
  return repModel;
}

export function assertCommissionPayableForModel(
  lead: Pick<Lead, "agreedTotalCents">,
  commission: Pick<Commission, "amountCents" | "isPaid">,
  settings: PortalSettingsValues,
  model: CommissionModel,
  deployedOrdinal: number | null
): void {
  if (commission.isPaid) {
    return;
  }
  if (model === CommissionModel.MODEL_A) {
    assertAgreedTotalMeetsMinimum(lead.agreedTotalCents, settings);
  }
  const issues = commissionIntegrityIssuesForModel(
    lead,
    commission,
    settings,
    model,
    deployedOrdinal
  );
  if (issues.length > 0) {
    throw new HttpError(400, "COMMISSION_INVALID", issues.join(" "));
  }
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
