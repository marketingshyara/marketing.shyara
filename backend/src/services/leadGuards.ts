import type { Lead } from "@prisma/client";
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
