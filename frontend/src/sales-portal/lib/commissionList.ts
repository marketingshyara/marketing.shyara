import type {
  CommissionListItem,
  PortalSettingsValues,
  RepPortalSettings
} from "../types";
import { commissionRateLabel } from "./commissionEstimate";
import { estimateCommissionCents, formatMinorUnits } from "./money";

export type CommissionValidationSettings = Pick<
  PortalSettingsValues,
  | "minAgreedTotalCents"
  | "commissionRateBps"
  | "commissionRounding"
  | "performanceBonusBps"
> & {
  commissionModel?: "MODEL_A" | "MODEL_B";
  milestoneAmountCents?: number;
  perDealAfterCents?: number;
};

export type CommissionRowStage = {
  siteLive: boolean;
  calculated: boolean;
  paid: boolean;
};

export function commissionRowStage(row: CommissionListItem): CommissionRowStage {
  const siteLive = row.lead.project?.deploymentVerifiedAt != null;
  return {
    siteLive,
    calculated: siteLive,
    paid: row.isPaid
  };
}

export function commissionValidationSettings(
  repSettings: RepPortalSettings,
  adminSettings?: PortalSettingsValues | null
): CommissionValidationSettings {
  if (repSettings.commissionModel === "MODEL_B") {
    return {
      commissionModel: "MODEL_B",
      minAgreedTotalCents: repSettings.minAgreedTotalCents,
      commissionRateBps: 0,
      commissionRounding: "bankers",
      performanceBonusBps: 0,
      milestoneAmountCents:
        repSettings.milestoneAmountCents ?? 1_000_000,
      perDealAfterCents: repSettings.perDealAfterCents ?? 200_000
    };
  }
  const rounding =
    repSettings.commissionRounding ??
    adminSettings?.commissionRounding;
  if (!rounding) {
    throw new Error("commissionRounding is required from portal settings");
  }
  return {
    commissionModel: "MODEL_A",
    minAgreedTotalCents: repSettings.minAgreedTotalCents,
    commissionRateBps: repSettings.commissionRateBps ?? adminSettings?.commissionRateBps ?? 0,
    commissionRounding: rounding,
    performanceBonusBps:
      repSettings.performanceBonusBps ?? adminSettings?.performanceBonusBps ?? 0
  };
}

/** Prefer server-computed issues; fall back to client validation in tests. */
export function rowIntegrityIssues(
  row: CommissionListItem,
  settings: CommissionValidationSettings
): string[] {
  if (row.integrityIssues?.length) {
    return row.integrityIssues;
  }
  return commissionDataIssues(row, settings);
}

export function expectedCommissionCents(
  row: CommissionListItem,
  settings: CommissionValidationSettings
): number | null {
  const base = row.lead.agreedTotalCents;
  if (base == null || base < 0) return null;
  return estimateCommissionCents(
    base,
    settings.commissionRateBps,
    settings.commissionRounding
  );
}

export function minimumExpectedCommissionCents(
  settings: CommissionValidationSettings
): number {
  return estimateCommissionCents(
    settings.minAgreedTotalCents,
    settings.commissionRateBps,
    settings.commissionRounding
  );
}

export function commissionDataIssues(
  row: CommissionListItem,
  settings: CommissionValidationSettings
): string[] {
  if (settings.commissionModel === "MODEL_B") {
    return row.integrityIssues ?? [];
  }
  const issues: string[] = [];
  const base = row.lead.agreedTotalCents;
  const minCommission = minimumExpectedCommissionCents(settings);

  if (base == null) {
    issues.push("Deal amount is missing on this lead.");
  } else if (base < settings.minAgreedTotalCents) {
    issues.push(
      `Deal amount ${formatMinorUnits(base)} is below the portal minimum ${formatMinorUnits(settings.minAgreedTotalCents)}.`
    );
  }

  const expected = expectedCommissionCents(row, settings);
  if (expected != null && row.amountCents !== expected) {
    issues.push(
      `Commission ${formatMinorUnits(row.amountCents)} does not match ${commissionRateLabel(settings)} of ${formatMinorUnits(base)} (expected ${formatMinorUnits(expected)}).`
    );
  }

  if (row.amountCents < minCommission) {
    issues.push(
      `Commission ${formatMinorUnits(row.amountCents)} is below minimum expected ${formatMinorUnits(minCommission)} for current rate and minimum deal.`
    );
  }

  return issues;
}

export function formatCommissionPaidAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function commissionDetailHref(
  row: CommissionListItem,
  actorMode: "rep" | "admin"
): string {
  if (actorMode === "admin") {
    return `/portal/team/${row.repUserId}/projects/${row.leadId}`;
  }
  return `/portal/pipeline/${row.leadId}`;
}
