import "dotenv/config";

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readOptionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/** Strip one pair of surrounding quotes often pasted into hosting env UIs. */
export function stripOuterQuotes(value: string): string {
  const t = value.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return value;
}

function intEnv(name: string, fallback: string, min: number): number {
  const fb = Math.trunc(Number(fallback));
  const safeFb = Number.isFinite(fb) && fb >= min ? fb : min;
  const raw = Number(readOptionalEnv(name, fallback));
  if (!Number.isFinite(raw)) return safeFb;
  const n = Math.trunc(raw);
  return n < min ? safeFb : n;
}

function requiredIntEnv(name: string, fallback: string, min: number): number {
  const raw = readOptionalEnv(name, fallback).trim();
  if (!/^-?\d+$/.test(raw)) {
    throw new Error(`Environment variable ${name} must be an integer.`);
  }
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < min) {
    throw new Error(`Environment variable ${name} must be an integer >= ${min}.`);
  }
  return n;
}

function parseCookieSameSite(raw: string): "lax" | "strict" | "none" {
  const s = raw.trim().toLowerCase();
  if (s === "strict" || s === "none" || s === "lax") return s;
  return "lax";
}

export type AppConfig = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  sessionSecret: string;
  cookieName: string;
  /** Session cookie SameSite. Use `none` when the browser origin is a different site than the API (e.g. SPA on your domain, API on onrender.com). Requires `secureCookie: true`. */
  cookieSameSite: "lax" | "strict" | "none";
  trustProxy: boolean;
  allowedOrigins: string[];
  secureCookie: boolean;
  /** Session cookie max-age in seconds (converted to ms for the cookie). */
  sessionMaxAgeSeconds: number;
  loginRateLimitMax: number;
  loginRateLimitWindowMs: number;
  /** Consecutive failed logins for a single account before the account is locked. */
  loginLockoutThreshold: number;
  /** Lock duration in seconds applied once the threshold is reached. */
  loginLockoutWindowSeconds: number;
  bcryptRounds: number;
  bootstrapAdminEmail: string | undefined;
  bootstrapAdminPassword: string | undefined;
  bootstrapAdminDisplayName: string | undefined;
};

export function loadConfig(): AppConfig {
  const nodeEnv = readOptionalEnv("NODE_ENV", "development");
  const isProd = nodeEnv === "production";
  const cookieSameSite = parseCookieSameSite(readOptionalEnv("COOKIE_SAMESITE", "lax"));
  let secureCookie = readOptionalEnv("COOKIE_SECURE", isProd ? "true" : "false") === "true";
  if (cookieSameSite === "none" && !secureCookie) {
    secureCookie = true;
  }

  return {
    nodeEnv,
    port: requiredIntEnv("PORT", "4000", 1),
    databaseUrl: readEnv("DATABASE_URL"),
    sessionSecret: stripOuterQuotes(readEnv("SESSION_SECRET")),
    cookieName: readOptionalEnv("COOKIE_NAME", "shyara_sales_session"),
    cookieSameSite,
    trustProxy: readOptionalEnv("TRUST_PROXY", isProd ? "true" : "false") === "true",
    allowedOrigins: readOptionalEnv("ALLOWED_ORIGINS", "http://localhost:8080")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    secureCookie,
    sessionMaxAgeSeconds: requiredIntEnv("SESSION_MAX_AGE_SECONDS", "604800", 60),
    loginRateLimitMax: intEnv("LOGIN_RATE_LIMIT_MAX", "5", 1),
    loginRateLimitWindowMs: intEnv("LOGIN_RATE_LIMIT_WINDOW_MS", "900000", 1000),
    loginLockoutThreshold: intEnv("LOGIN_LOCKOUT_THRESHOLD", "5", 1),
    loginLockoutWindowSeconds: intEnv("LOGIN_LOCKOUT_WINDOW_SECONDS", "900", 60),
    bcryptRounds: requiredIntEnv("BCRYPT_ROUNDS", "10", 4),
    bootstrapAdminEmail: process.env.BOOTSTRAP_ADMIN_EMAIL,
    bootstrapAdminPassword: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    bootstrapAdminDisplayName: process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME
  };
}
