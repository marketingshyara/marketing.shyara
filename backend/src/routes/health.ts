import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/health", async (request) => {
    const deep =
      request.query &&
      typeof request.query === "object" &&
      "deep" in request.query &&
      String((request.query as { deep?: string }).deep) === "1";

    if (!deep) {
      return { ok: true };
    }

    await app.prisma.$queryRaw`SELECT 1`;
    return { ok: true, deep: true, database: "ok" };
  });
}
