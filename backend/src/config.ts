import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

let envLoaded = false;

const envSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SESSION_SECRET: z.string().min(24, "SESSION_SECRET must be at least 24 characters."),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  ALLOWED_ORIGINS: z.string().min(1, "ALLOWED_ORIGINS is required."),
  BOOTSTRAP_ADMIN_NAME: z.string().min(1, "BOOTSTRAP_ADMIN_NAME is required."),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email("BOOTSTRAP_ADMIN_EMAIL must be a valid email."),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(12, "BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.")
});

export interface RuntimeConfig {
  host: string;
  port: number;
  nodeEnv: "development" | "test" | "production";
  sessionSecret: string;
  databaseUrl: string;
  allowedOrigins: string[];
  bootstrapAdminName: string;
  bootstrapAdminEmail: string;
  bootstrapAdminPassword: string;
  secureCookies: boolean;
}

function loadEnv() {
  if (envLoaded) return;
  dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
  dotenv.config();
  envLoaded = true;
}

export function readConfig(): RuntimeConfig {
  loadEnv();
  const env = envSchema.parse(process.env);

  return {
    host: env.HOST,
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    sessionSecret: env.SESSION_SECRET,
    databaseUrl: env.DATABASE_URL,
    allowedOrigins: env.ALLOWED_ORIGINS.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    bootstrapAdminName: env.BOOTSTRAP_ADMIN_NAME,
    bootstrapAdminEmail: env.BOOTSTRAP_ADMIN_EMAIL,
    bootstrapAdminPassword: env.BOOTSTRAP_ADMIN_PASSWORD,
    secureCookies: env.NODE_ENV === "production"
  };
}
