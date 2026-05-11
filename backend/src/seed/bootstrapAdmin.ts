import "dotenv/config";
import { stripOuterQuotes } from "../config.js";
import { ensureBootstrapAdmin } from "../lib/ensureBootstrapAdmin.js";
import { prisma } from "../lib/prisma.js";

async function main(): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? "10");
  const displayNameRaw = process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME;

  await ensureBootstrapAdmin(prisma, {
    email: stripOuterQuotes(email),
    password: stripOuterQuotes(password),
    displayName: displayNameRaw ? stripOuterQuotes(displayNameRaw) : undefined,
    bcryptRounds
  });

  console.log("Bootstrap admin ready:", stripOuterQuotes(email).toLowerCase().trim());
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
