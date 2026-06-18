/**
 * Permanently delete a portal user by email (releases email for re-registration).
 *
 * Usage (from backend/):
 *   npx tsx src/scripts/deleteUserByEmail.ts preetsikarwar@gmail.com
 *   npx tsx src/scripts/deleteUserByEmail.ts preetsikarwar@gmail.com --confirm
 */
import "dotenv/config";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { deleteUserForAdmin } from "../services/userDelete.js";

async function main() {
  const emailArg = process.argv[2]?.toLowerCase().trim();
  const confirm = process.argv.includes("--confirm");

  if (!emailArg) {
    console.error("Usage: npx tsx src/scripts/deleteUserByEmail.ts <email> [--confirm]");
    process.exit(1);
  }

  const target = await prisma.user.findUnique({ where: { email: emailArg } });
  if (!target) {
    console.log(`No user found with email ${emailArg}.`);
    return;
  }

  const actor =
    (await prisma.user.findFirst({
      where: { role: UserRole.ADMIN, isActive: true, archivedAt: null, id: { not: target.id } }
    })) ??
    (await prisma.user.findFirst({
      where: { role: UserRole.ADMIN, archivedAt: null, id: { not: target.id } }
    }));

  if (!actor) {
    console.error("No other admin account found to perform the deletion.");
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        target: { id: target.id, email: target.email, role: target.role, archivedAt: target.archivedAt },
        actor: { id: actor.id, email: actor.email },
        confirm
      },
      null,
      2
    )
  );

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to permanently delete this user.");
    return;
  }

  const result = await deleteUserForAdmin(prisma, actor.id, target.id);
  console.log(`Deleted user ${result.email}. Email can be used to create a new account.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
