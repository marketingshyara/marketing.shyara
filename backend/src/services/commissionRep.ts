import type { Lead } from "@prisma/client";

/** Commission is always attributed to the assigned rep when set; otherwise the creator. */
export function getCommissionRepUserId(lead: Lead): string {
  return lead.assignedToUserId ?? lead.createdByUserId;
}
