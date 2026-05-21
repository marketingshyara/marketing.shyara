/** Prevent open redirects: only same-origin-style paths under `/portal`. */

const MAX_PORTAL_RETURN_LEN = 2048;

function hasAsciiControl(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

/**
 * Returns a safe `/portal...` path+search or `null` if the value must be rejected.
 */
export function normalizePortalReturnCandidate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length === 0 || t.length > MAX_PORTAL_RETURN_LEN) return null;
  if (hasAsciiControl(t)) return null;
  if (t.includes("//") || /^[a-z][a-z0-9+.-]*:/i.test(t)) return null;
  if (!t.startsWith("/")) return null;
  if (!t.startsWith("/portal")) return null;
  return t;
}

/**
 * First valid candidate wins (e.g. `returnTo` query, then `location.state.from`), else `fallback`.
 */
export function getSafePortalReturnPath(fallback: string, ...candidates: unknown[]): string {
  for (const c of candidates) {
    const n = normalizePortalReturnCandidate(c);
    if (n) return n;
  }
  const fb = normalizePortalReturnCandidate(fallback);
  return fb ?? "/portal/pipeline";
}

export function sanitizePortalRedirectPath(raw: unknown, fallback = "/portal/pipeline"): string {
  return normalizePortalReturnCandidate(raw) ?? fallback;
}
