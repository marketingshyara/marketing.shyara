import type { FastifyRequest } from "fastify";
import type { ActivityAction, Prisma, PrismaClient } from "@prisma/client";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export type LogActivityInput = {
  prisma: PrismaClient;
  userId: string | null;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  request: FastifyRequest;
  /**
   * When provided, the audit row is created via this transaction client.
   * The audit then commits or rolls back together with the parent mutation,
   * which is required for money-related actions (verify, mark-paid, transition, lead PATCH).
   * Errors are propagated so the parent transaction rolls back atomically.
   */
  tx?: Prisma.TransactionClient;
};

export async function logActivity(input: LogActivityInput): Promise<void> {
  const { prisma, tx, userId, action, entityType, entityId, before, after, request } = input;
  const client: PrismaLike = tx ?? prisma;
  const userAgent = request.headers["user-agent"];
  // request.ip is set by Fastify using the trustProxy configuration. With trustProxy=true it honours
  // X-Forwarded-For; with trustProxy=false it falls back to the socket address, so spoofed headers
  // from direct callers are ignored.
  const ip = request.ip;

  try {
    await client.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ip,
        userAgent: typeof userAgent === "string" ? userAgent : undefined,
        before: before ?? undefined,
        after: after ?? undefined
      }
    });
  } catch (err) {
    if (tx) {
      // Inside a transaction the audit log is part of the durability contract; bubble up.
      throw err;
    }
    request.log.warn({ err }, "activityLog.create failed (non-tx, swallowed)");
  }
}
