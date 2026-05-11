import type { FastifyInstance } from "fastify";
import { requireUser } from "../auth/requireUser.js";

export async function registerWebsiteTemplateRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/website-templates",
    { preHandler: [requireUser] },
    async (_request, reply) => {
      const items = await app.prisma.websiteTemplate.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
      });
      return reply.send({ items });
    }
  );
}
