import type { Lead, LeadStatus, PortalSettingsValues, UserRole } from "../types";

export function isLeadTerminal(lead: Lead, settings: PortalSettingsValues): boolean {
  return settings.terminalNoMutationStatuses.includes(lead.status);
}

export function getAllowedTransitions(
  settings: PortalSettingsValues,
  lead: Lead,
  role: UserRole
) {
  return settings.manualTransitions.filter(
    (t) =>
      t.enabled &&
      t.from === lead.status &&
      (!t.adminOnly || role === "ADMIN") &&
      t.to !== lead.status
  );
}

export function canMarkAdvance(lead: Lead, settings: PortalSettingsValues): boolean {
  if (isLeadTerminal(lead, settings)) return false;
  return lead.status === settings.advancePaymentRequiredLeadStatus;
}

export function canMarkFinal(lead: Lead, settings: PortalSettingsValues): boolean {
  if (isLeadTerminal(lead, settings)) return false;
  return lead.status === settings.finalPaymentRequiredLeadStatus;
}
