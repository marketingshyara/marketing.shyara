import type { FastifyBaseLogger } from "fastify";
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { stripOuterQuotes } from "../config.js";

export type EnsureBootstrapAdminInput = {
  email: string;
  password: string;
  displayName?: string;
  bcryptRounds: number;
};

/**
 * Idempotent upsert of the bootstrap admin user (same logic as the seed script).
 * Does not log passwords.
 */
export async function ensureBootstrapAdmin(
  prisma: PrismaClient,
  input: EnsureBootstrapAdminInput
): Promise<void> {
  const emailNorm = input.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(input.password, input.bcryptRounds);
  const displayName = input.displayName?.trim() || "Admin";

  // Only clobber the password on update when explicitly opted in, so production restarts don't
  // silently overwrite a rotated admin password with the value stuck in the env var.
  const resetPasswordOnUpdate = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD === "true";

  await prisma.user.upsert({
    where: { email: emailNorm },
    create: {
      email: emailNorm,
      passwordHash,
      displayName,
      role: UserRole.ADMIN,
      isActive: true,
      mustChangePassword: false
    },
    update: {
      displayName,
      role: UserRole.ADMIN,
      isActive: true,
      ...(resetPasswordOnUpdate ? { passwordHash, mustChangePassword: false } : {})
    }
  });
}

/**
 * When BOOTSTRAP_ADMIN_ON_START=true, upserts bootstrap admin from env if email and password are set.
 * Safe to call on every server start; no-op if flag is off or credentials missing.
 */
export async function ensureBootstrapAdminFromEnv(
  prisma: PrismaClient,
  bcryptRounds: number,
  log?: FastifyBaseLogger
): Promise<void> {
  if (process.env.BOOTSTRAP_ADMIN_ON_START !== "true") {
    return;
  }

  const rawEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const rawPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!rawEmail?.trim() || !rawPassword?.trim()) {
    log?.warn(
      "BOOTSTRAP_ADMIN_ON_START is true but BOOTSTRAP_ADMIN_EMAIL or BOOTSTRAP_ADMIN_PASSWORD is missing; skipping bootstrap."
    );
    return;
  }

  const email = stripOuterQuotes(rawEmail);
  const password = stripOuterQuotes(rawPassword);
  const displayNameRaw = process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME;
  const displayName = displayNameRaw ? stripOuterQuotes(displayNameRaw) : undefined;

  await ensureBootstrapAdmin(prisma, {
    email,
    password,
    displayName,
    bcryptRounds
  });

  log?.info({ email: email.toLowerCase().trim() }, "Bootstrap admin user ensured (startup)");
}
