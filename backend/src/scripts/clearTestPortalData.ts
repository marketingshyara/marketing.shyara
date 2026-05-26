/**
 * Dev-only: remove all leads (and cascaded payments, projects, commissions) and optional test users.
 *
 * Usage (from backend/):
 *   npx tsx src/scripts/clearTestPortalData.ts
 *   npx tsx src/scripts/clearTestPortalData.ts --users
 *
 * Requires DATABASE_URL. Do not run against production.
 */
import { prisma } from "../lib/prisma.js";

async function main() {
  const deleteUsers = process.argv.includes("--users");

  const [commissions, payments, projects, leads] = await prisma.$transaction([
    prisma.commission.deleteMany(),
    prisma.leadPayment.deleteMany(),
    prisma.project.deleteMany(),
    prisma.lead.deleteMany()
  ]);

  let users = { count: 0 };
  if (deleteUsers) {
    users = await prisma.user.deleteMany({
      where: { email: { endsWith: "@test.local" } }
    });
  }

  console.log(
    JSON.stringify(
      {
        leads: leads.count,
        projects: projects.count,
        payments: payments.count,
        commissions: commissions.count,
        testUsers: users.count
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
