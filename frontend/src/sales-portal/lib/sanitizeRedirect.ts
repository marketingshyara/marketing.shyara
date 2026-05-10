/** Prevent open redirects: only same-origin-style paths under `/portal`. */
function hasAsciiControl(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return true;
  }
  return false;
}

export function sanitizePortalRedirectPath(raw: unknown, fallback = "/portal/leads"): string {
  if (typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (t.length === 0) return fallback;
  if (hasAsciiControl(t)) return fallback;
  if (t.includes("//") || /^[a-z][a-z0-9+.-]*:/i.test(t)) return fallback;
  if (!t.startsWith("/")) return fallback;
  if (!t.startsWith("/portal")) return fallback;
  return t;
}
