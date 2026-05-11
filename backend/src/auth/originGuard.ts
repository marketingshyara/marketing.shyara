import type { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../errors/httpError.js";

const STATE_CHANGING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * Defence-in-depth for CSRF: with cookie `SameSite=lax` browsers won't forward our session cookie
 * on cross-site POSTs in most cases, but `SameSite=none` deployments need an explicit Origin
 * check, and even on `lax` belt-and-suspenders is cheap. GET requests are allowed without Origin
 * so curl/Postman/health probes keep working.
 *
 * The guard rejects any state-changing request whose Origin header is missing or not in the
 * configured allow-list. Skips internal health endpoints which are intentionally script-friendly.
 */
export function makeOriginGuard(allowedOrigins: string[], skipPathPrefixes: string[] = ["/api/health"]) {
  const allowed = new Set(allowedOrigins);
  return async function originGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (!STATE_CHANGING_METHODS.has(request.method)) {
      return;
    }
    if (skipPathPrefixes.some((p) => request.url === p || request.url.startsWith(`${p}?`))) {
      return;
    }
    const origin = request.headers.origin;
    if (typeof origin !== "string" || origin.length === 0) {
      throw new HttpError(403, "CSRF_NO_ORIGIN", "Origin header required for state-changing requests.");
    }
    if (!allowed.has(origin)) {
      throw new HttpError(403, "CSRF_BAD_ORIGIN", "Origin not allowed.");
    }
  };
}
