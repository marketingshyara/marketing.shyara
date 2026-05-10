import type { UserRole } from "@prisma/client";

declare module "fastify" {
  interface Session {
    userId?: string;
    role?: UserRole;
  }
}
