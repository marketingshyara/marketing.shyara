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
    port: Number(readOptionalEnv("PORT", "4000")),
    databaseUrl: readEnv("DATABASE_URL"),
    sessionSecret: readEnv("SESSION_SECRET"),
    cookieName: readOptionalEnv("COOKIE_NAME", "shyara_sales_session"),
    cookieSameSite,
    trustProxy: readOptionalEnv("TRUST_PROXY", isProd ? "true" : "false") === "true",
    allowedOrigins: readOptionalEnv("ALLOWED_ORIGINS", "http://localhost:8080")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    secureCookie,
    sessionMaxAgeSeconds: Number(readOptionalEnv("SESSION_MAX_AGE_SECONDS", "604800")),
    loginRateLimitMax: Number(readOptionalEnv("LOGIN_RATE_LIMIT_MAX", "5")),
    loginRateLimitWindowMs: Number(readOptionalEnv("LOGIN_RATE_LIMIT_WINDOW_MS", "900000")),
    bcryptRounds: Number(readOptionalEnv("BCRYPT_ROUNDS", "10")),
    bootstrapAdminEmail: process.env.BOOTSTRAP_ADMIN_EMAIL,
    bootstrapAdminPassword: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    bootstrapAdminDisplayName: process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME
  };
}
