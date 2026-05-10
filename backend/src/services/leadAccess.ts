import type { Lead, User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";

export function assertLeadAccess(lead: Lead, user: User): void {
  if (user.role === UserRole.ADMIN) {
    return;
  }
  if (lead.createdByUserId === user.id || lead.assignedToUserId === user.id) {
    return;
  }
  throw new HttpError(403, "FORBIDDEN", "You cannot access this lead.");
}
