import type { FastifyInstance } from "fastify";
import { requireUser } from "../auth/requireUser.js";
import { unreadNotificationCount } from "../services/notifications.js";
import { paginationQuerySchema } from "../validators/schemas.js";
import { z } from "zod";

const notificationsQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z
    .union([z.literal("1"), z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === "1" || v === "true" || v === true)
});

export async function registerNotificationRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/notifications/unread-count",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const total = await unreadNotificationCount(app.prisma, user.id);
      return reply.send({ total });
    }
  );

  app.get(
    "/api/notifications",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const query = notificationsQuerySchema.parse(request.query);
      const where = {
        userId: user.id,
        ...(query.unreadOnly ? { readAt: null } : {})
      };
      const total = await app.prisma.portalNotification.count({ where });
      const skip = (query.page - 1) * query.pageSize;
      const items = await app.prisma.portalNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
        include: {
          lead: { select: { assignedToUserId: true, createdByUserId: true } }
        }
      });
      return reply.send({
        items: items.map((n) => ({
          id: n.id,
          leadId: n.leadId,
          repId: n.lead.assignedToUserId ?? n.lead.createdByUserId,
          kind: n.kind,
          stageKey: n.stageKey,
          message: n.message,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString()
        })),
        total,
        page: query.page,
        pageSize: query.pageSize
      });
    }
  );

  app.post(
    "/api/notifications/:id/read",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const claim = await app.prisma.portalNotification.updateMany({
        where: { id, userId: user.id, readAt: null },
        data: { readAt: new Date() }
      });
      if (claim.count === 0) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Notification not found." }
        });
      }
      return reply.send({ ok: true });
    }
  );
}
