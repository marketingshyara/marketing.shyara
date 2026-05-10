import type { Lead } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import type { PortalSettingsValues } from "../validators/schemas.js";

export type LeadMutationOp = "PATCH_FIELDS" | "MARK_PAYMENT" | "TRANSITION";

export function assertLeadMutableForOp(
  lead: Lead,
  settings: PortalSettingsValues,
  _op: LeadMutationOp
): void {
  if (settings.terminalNoMutationStatuses.includes(lead.status)) {
    throw new HttpError(
      400,
      "LEAD_TERMINAL",
      "This lead is in a terminal state and cannot be changed."
    );
  }
}
