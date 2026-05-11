import { PrismaClient } from "@prisma/client";

/**
 * The Fastify backend runs as a single long-lived process per instance; we don't need the
 * Next.js-style `globalThis` cache that protects against module-reload re-instantiation. A plain
 * singleton is enough and avoids leaking a Prisma client across hot-reload boundaries in dev.
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
});
