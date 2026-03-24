import { PrismaClient } from "@prisma/client";
import { readConfig } from "../config";
import { PrismaPortalRepository } from "../store/prismaPortalRepository";

const config = readConfig();
const prisma = new PrismaClient();
const repository = new PrismaPortalRepository(prisma, {
  adminName: config.bootstrapAdminName,
  adminEmail: config.bootstrapAdminEmail,
  adminPassword: config.bootstrapAdminPassword
});

await repository.load();

console.log("Portal bootstrap data is ready in Postgres.");
console.log(`Admin email: ${config.bootstrapAdminEmail}`);

await prisma.$disconnect();
