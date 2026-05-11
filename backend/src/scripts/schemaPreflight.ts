import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const checks: Array<{ name: string; sql: string }> = [
  { name: "User", sql: 'SELECT "id","email","passwordHash","role","isActive" FROM "User" LIMIT 0' },
  { name: "Lead", sql: 'SELECT "id","clientName","status","createdByUserId" FROM "Lead" LIMIT 0' },
  { name: "PortalSettings", sql: 'SELECT "id","values","updatedAt" FROM "PortalSettings" LIMIT 0' },
  { name: "LeadPayment", sql: 'SELECT "id","leadId","kind","verificationStatus" FROM "LeadPayment" LIMIT 0' },
  { name: "Project", sql: 'SELECT "id","leadId","title" FROM "Project" LIMIT 0' },
  { name: "Commission", sql: 'SELECT "id","leadId","repUserId","amountCents" FROM "Commission" LIMIT 0' },
  { name: "ActivityLog", sql: 'SELECT "id","action","entityType","entityId" FROM "ActivityLog" LIMIT 0' }
];

async function main(): Promise<void> {
  let failed = false;

  for (const c of checks) {
    try {
      await prisma.$queryRawUnsafe(c.sql);
      console.log(`OK: ${c.name}`);
    } catch (err) {
      failed = true;
      console.error(`FAILED: ${c.name}`);
      console.error(err);
    }
  }

  await prisma.$disconnect();

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log("Schema preflight passed.");
}

await main();
