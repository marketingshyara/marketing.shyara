import type { UserRole } from "../types";
import { getSafePortalReturnPath } from "./sanitizeRedirect";

export function defaultPortalHome(role: UserRole): string {
  return role === "ADMIN" ? "/portal/team" : "/portal/pipeline";
}

const REP_ONLY_PREFIXES = ["/portal/pipeline", "/portal/resources"] as const;
const ADMIN_ONLY_PREFIXES = ["/portal/team", "/portal/reviews", "/portal/users", "/portal/settings"] as const;

function pathMatchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function resolvePortalDestination(role: UserRole, ...candidates: unknown[]): string {
  const fallback = defaultPortalHome(role);
  const path = getSafePortalReturnPath(fallback, ...candidates);
  if (role === "ADMIN" && REP_ONLY_PREFIXES.some((p) => pathMatchesPrefix(path, p))) {
    return fallback;
  }
  if (role === "SALES_REP" && ADMIN_ONLY_PREFIXES.some((p) => pathMatchesPrefix(path, p))) {
    return fallback;
  }
  return path;
}
