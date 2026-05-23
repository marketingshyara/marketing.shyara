import { LeadStatus, UserRole } from "@prisma/client";
import type { Lead } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import { divideCentsWithRounding } from "../lib/money.js";
import type { PortalSettingsValues } from "../validators/schemas.js";

export function assertManualTransition(
  settings: PortalSettingsValues,
  current: LeadStatus,
  next: LeadStatus,
  role: UserRole
): void {
  if (current === next) {
    throw new HttpError(400, "INVALID_TRANSITION", "Lead is already in this status.");
  }

  const edge = settings.manualTransitions.find(
    (candidate) => candidate.enabled && candidate.from === current && candidate.to === next
  );
  if (!edge) {
    throw new HttpError(
      400,
      "INVALID_TRANSITION",
      `Cannot move lead from ${current} to ${next} via transition endpoint.`
    );
  }

  if (edge.adminOnly && role !== UserRole.ADMIN) {
    throw new HttpError(403, "FORBIDDEN", "Only an admin can perform this status change.");
  }
}

export function commissionAmountCents(
  lead: Lead,
  _verifiedFinalPaymentCents: number,
  settings: PortalSettingsValues
): number {
  const rate = settings.commissionRateBps;
  const base = lead.agreedTotalCents ?? -1;

  if (base === null || base === undefined || base < 0) {
    throw new HttpError(
      400,
      "COMMISSION_BASE_MISSING",
      "Lead is missing agreedTotalCents; set the agreed total before computing commission."
    );
  }

  return divideCentsWithRounding(base * rate, 10000, settings.commissionRounding);
}
