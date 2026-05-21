import type { UserRole } from "../types";
import { getSafePortalReturnPath } from "./sanitizeRedirect";

const ADMIN_REVIEWS_LANDING_KEY = "portal_admin_reviews_landing_done";

export function defaultPortalHome(role: UserRole): string {
  return role === "ADMIN" ? "/portal/team" : "/portal/pipeline";
}

const REP_ONLY_PREFIXES = [
  "/portal/pipeline",
  "/portal/resources",
  "/portal/commission"
] as const;

const ADMIN_ONLY_PREFIXES = [
  "/portal/team",
  "/portal/reviews",
  "/portal/payments",
  "/portal/activity",
  "/portal/users",
  "/portal/settings"
] as const;

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

/** After login: send admins with pending work to Reviews once per browser session. */
export function resolvePortalDestinationAfterLogin(
  role: UserRole,
  intended: string,
  pendingActionsTotal?: number
): string {
  const dest = resolvePortalDestination(role, intended);
  if (role !== "ADMIN") return dest;
  if (dest !== defaultPortalHome("ADMIN")) return dest;
  if ((pendingActionsTotal ?? 0) <= 0) return dest;
  if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(ADMIN_REVIEWS_LANDING_KEY)) {
    return dest;
  }
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(ADMIN_REVIEWS_LANDING_KEY, "1");
  }
  return "/portal/reviews";
}
