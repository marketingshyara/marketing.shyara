import type { User } from "@prisma/client";

/** User may sign in and use the portal (not archived, still active). */
export function isUserAuthenticatable(user: Pick<User, "isActive" | "archivedAt">): boolean {
  return user.isActive && user.archivedAt == null;
}
