import "dotenv/config";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

async function main(): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? "10");
  const passwordHash = await bcrypt.hash(password, bcryptRounds);
  const displayName = process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME ?? "Admin";

  await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      displayName,
      role: UserRole.ADMIN,
      isActive: true,
      mustChangePassword: false
    },
    update: {
      passwordHash,
      displayName,
      role: UserRole.ADMIN,
      isActive: true
    }
  });

  console.log("Bootstrap admin ready:", email.toLowerCase().trim());
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
