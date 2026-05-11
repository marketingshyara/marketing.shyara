import type { FastifyBaseLogger } from "fastify";
import type { PrismaClient } from "@prisma/client";

const CHECKS: Array<{ name: string; sql: string }> = [
  { name: "User core columns", sql: 'SELECT "id","email","passwordHash","role","isActive" FROM "User" LIMIT 0' },
  { name: "Lead core columns", sql: 'SELECT "id","clientName","status","createdByUserId" FROM "Lead" LIMIT 0' },
  { name: "PortalSettings core columns", sql: 'SELECT "id","values","updatedAt" FROM "PortalSettings" LIMIT 0' },
  { name: "LeadPayment table", sql: 'SELECT "id","leadId","kind","verificationStatus" FROM "LeadPayment" LIMIT 0' },
  { name: "Project core columns", sql: 'SELECT "id","leadId","title" FROM "Project" LIMIT 0' },
  { name: "Commission table", sql: 'SELECT "id","leadId","repUserId","amountCents" FROM "Commission" LIMIT 0' },
  { name: "ActivityLog table", sql: 'SELECT "id","action","entityType","entityId" FROM "ActivityLog" LIMIT 0' }
];

/**
 * Read-only sanity checks to catch severe schema drift early.
 * Returns false when any critical check fails.
 */
export async function runSchemaSanityChecks(
  prisma: PrismaClient,
  log?: FastifyBaseLogger
): Promise<boolean> {
  let ok = true;
  for (const check of CHECKS) {
    try {
      await prisma.$queryRawUnsafe(check.sql);
    } catch (err) {
      ok = false;
      log?.error({ err, check: check.name }, "Schema sanity check failed");
    }
  }
  if (ok) {
    log?.info("Schema sanity checks passed");
  } else {
    log?.warn("Schema sanity checks found drift; app will continue with DB error mapping enabled");
  }
  return ok;
}
