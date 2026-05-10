import type { FastifyRequest } from "fastify";
import { HttpError } from "../errors/httpError.js";

export async function requireUser(request: FastifyRequest): Promise<void> {
  const userId = request.session.get("userId");
  if (!userId) {
    throw new HttpError(401, "UNAUTHORIZED", "Not authenticated.");
  }

  const user = await request.server.prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.isActive) {
    await request.session.destroy();
    throw new HttpError(401, "UNAUTHORIZED", "Session invalid or user inactive.");
  }

  request.currentUser = user;
}
