import type { FastifyInstance } from "fastify";
import { clampPage } from "../lib/pagination.js";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { activityLogsQuerySchema } from "../validators/schemas.js";

export async function registerActivityLogRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/activity-logs",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const query = activityLogsQuerySchema.parse(request.query);

      const where = {
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.entityType ? { entityType: query.entityType } : {}),
        ...(query.entityId ? { entityId: query.entityId } : {}),
        ...(query.from || query.to
          ? {
              createdAt: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {})
              }
            }
          : {})
      };

      const total = await app.prisma.activityLog.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.activityLog.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );
}
