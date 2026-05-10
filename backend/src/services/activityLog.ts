import type { FastifyRequest } from "fastify";
import type { ActivityAction, Prisma, PrismaClient } from "@prisma/client";

function clientIp(request: FastifyRequest): string | undefined {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim();
  }
  return request.socket.remoteAddress;
}

export type LogActivityInput = {
  prisma: PrismaClient;
  userId: string | null;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  request: FastifyRequest;
};

export async function logActivity(input: LogActivityInput): Promise<void> {
  const { prisma, userId, action, entityType, entityId, before, after, request } = input;
  const userAgent = request.headers["user-agent"];

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ip: clientIp(request),
        userAgent: typeof userAgent === "string" ? userAgent : undefined,
        before: before ?? undefined,
        after: after ?? undefined
      }
    });
  } catch (err) {
    request.log.error({ err }, "activityLog.create failed");
  }
}
