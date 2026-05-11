import type { FastifyInstance } from "fastify";
import { z } from "zod";

/**
 * Accept only the literal `?deep=1` value; anything else is coerced to a shallow health probe so
 * untrusted callers can't accidentally trigger a database round-trip.
 */
const healthQuerySchema = z.object({
  deep: z.enum(["1"]).optional()
});

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/health", async (request) => {
    const query = healthQuerySchema.safeParse(request.query);
    const deep = query.success && query.data.deep === "1";

    if (!deep) {
      return { ok: true };
    }

    await app.prisma.$queryRaw`SELECT 1`;
    return { ok: true, deep: true, database: "ok" };
  });
}
