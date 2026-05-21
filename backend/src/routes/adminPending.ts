import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { clampPage } from "../lib/pagination.js";
import { countPendingActions, listPendingActions } from "../services/adminPending.js";
import { z } from "zod";
import { paginationQuerySchema } from "../validators/schemas.js";

const pendingActionsQuerySchema = paginationQuerySchema.extend({
  type: z
    .enum([
      "PAYMENT",
      "WHATSAPP",
      "DEMO_FINALIZED",
      "ACCOUNTS",
      "BUILD_DEMO",
      "REPO_TRANSFER",
      "DEPLOYMENT",
      "COMMISSION"
    ])
    .optional()
});

export async function registerAdminPendingRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/admin/pending-actions/count",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const total = await countPendingActions(app.prisma);
      return reply.send({ total });
    }
  );

  app.get(
    "/api/admin/pending-actions",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const query = pendingActionsQuerySchema.parse(request.query);
      const { items, total } = await listPendingActions(app.prisma, {
        type: query.type,
        page: query.page,
        pageSize: query.pageSize
      });
      const page = clampPage(query.page, query.pageSize, total);
      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );
}
