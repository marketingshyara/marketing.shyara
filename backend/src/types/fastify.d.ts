import type { PrismaClient, User } from "@prisma/client";
import type { AppConfig } from "../config.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    appConfig: AppConfig;
  }

  interface FastifyRequest {
    currentUser?: User;
  }
}
