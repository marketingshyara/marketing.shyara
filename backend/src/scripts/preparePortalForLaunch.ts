/**
 * Wipe QA transactional data before sales-team launch. Preserves admin users and catalog rows.
 *
 * Usage (from backend/):
 *   npx tsx src/scripts/preparePortalForLaunch.ts              # dry-run counts
 *   npx tsx src/scripts/preparePortalForLaunch.ts --confirm    # execute wipe
 *   npx tsx src/scripts/preparePortalForLaunch.ts --confirm --reset-settings
 *   npx tsx src/scripts/preparePortalForLaunch.ts --confirm --keep=bootstrap
 *
 * Requires DATABASE_URL. Use --allow-local only for local dev databases.
 */
import "dotenv/config";
import { UserRole } from "@prisma/client";
import { stripOuterQuotes } from "../config.js";
import { prisma } from "../lib/prisma.js";

type KeepMode = "admins" | "bootstrap";

function parseArgs(argv: string[]) {
  const confirm = argv.includes("--confirm");
  const allowLocal = argv.includes("--allow-local");
  const resetSettings = argv.includes("--reset-settings");

  let keep: KeepMode = "admins";
  for (const arg of argv) {
    if (arg.startsWith("--keep=")) {
      const value = arg.slice("--keep=".length);
      if (value === "admins" || value === "bootstrap") {
        keep = value;
      } else {
        throw new Error(`Invalid --keep value: ${value}. Use admins or bootstrap.`);
      }
    }
  }

  return { confirm, allowLocal, resetSettings, keep };
}

function databaseHost(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

function isLocalHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function bootstrapEmailNorm(): string | null {
  const raw = process.env.BOOTSTRAP_ADMIN_EMAIL;
  if (!raw?.trim()) return null;
  return stripOuterQuotes(raw).toLowerCase().trim();
}

async function countSnapshot() {
  const [
    sessions,
    notifications,
    activityLogs,
    commissions,
    payments,
    projects,
    leads,
    salesReps,
    admins,
    users
  ] = await Promise.all([
    prisma.portalSession.count(),
    prisma.portalNotification.count(),
    prisma.activityLog.count(),
    prisma.commission.count(),
    prisma.leadPayment.count(),
    prisma.project.count(),
    prisma.lead.count(),
    prisma.user.count({ where: { role: UserRole.SALES_REP } }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.user.count()
  ]);

  return {
    portal_sessions: sessions,
    portalNotifications: notifications,
    activityLogs,
    commissions,
    leadPayments: payments,
    projects,
    leads,
    salesReps,
    admins,
    users
  };
}

async function executeWipe(keep: KeepMode, resetSettings: boolean) {
  const [sessions, notifications, activityLogs, commissions, payments, projects, leads] =
    await prisma.$transaction([
      prisma.portalSession.deleteMany(),
      prisma.portalNotification.deleteMany(),
      prisma.activityLog.deleteMany(),
      prisma.commission.deleteMany(),
      prisma.leadPayment.deleteMany(),
      prisma.project.deleteMany(),
      prisma.lead.deleteMany()
    ]);

  let usersDeleted = { count: 0 };
  if (keep === "admins") {
    usersDeleted = await prisma.user.deleteMany({
      where: { role: UserRole.SALES_REP }
    });
  } else {
    const bootstrapEmail = bootstrapEmailNorm();
    if (!bootstrapEmail) {
      throw new Error(
        "BOOTSTRAP_ADMIN_EMAIL is required when using --keep=bootstrap"
      );
    }
    usersDeleted = await prisma.user.deleteMany({
      where: { email: { not: bootstrapEmail } }
    });
  }

  let settingsUpdated = false;
  if (resetSettings) {
    await prisma.portalSettings.update({
      where: { id: "default" },
      data: { values: {} }
    });
    settingsUpdated = true;
  }

  return {
    deleted: {
      portal_sessions: sessions.count,
      portalNotifications: notifications.count,
      activityLogs: activityLogs.count,
      commissions: commissions.count,
      leadPayments: payments.count,
      projects: projects.count,
      leads: leads.count,
      users: usersDeleted.count
    },
    settingsReset: settingsUpdated
  };
}

async function main() {
  const { confirm, allowLocal, resetSettings, keep } = parseArgs(process.argv.slice(2));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const host = databaseHost(databaseUrl);
  if (isLocalHost(host) && !allowLocal) {
    console.error(
      `Refusing to run against local host "${host}". Pass --allow-local for dev databases.`
    );
    process.exit(1);
  }

  if (keep === "bootstrap" && !bootstrapEmailNorm()) {
    console.error("BOOTSTRAP_ADMIN_EMAIL must be set when using --keep=bootstrap.");
    process.exit(1);
  }

  const before = await countSnapshot();

  const payload: Record<string, unknown> = {
    mode: confirm ? "execute" : "dry-run",
    databaseHost: host,
    keep,
    resetSettings,
    before
  };

  if (confirm) {
    payload.result = await executeWipe(keep, resetSettings);
    payload.after = await countSnapshot();
  } else {
    payload.hint = "Re-run with --confirm to delete the rows counted in before.";
  }

  console.log(JSON.stringify(payload, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
