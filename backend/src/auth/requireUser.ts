import type { FastifyRequest } from "fastify";
import { HttpError } from "../errors/httpError.js";
import { isUserAuthenticatable } from "../services/userAuth.js";

type RequireUserOptions = {
  allowPasswordChangeRequired?: boolean;
};

async function requireUserImpl(request: FastifyRequest, options: RequireUserOptions): Promise<void> {
  const userId = request.session.get("userId");
  if (!userId) {
    throw new HttpError(401, "UNAUTHORIZED", "Not authenticated.");
  }

  const user = await request.server.prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !isUserAuthenticatable(user)) {
    await request.session.destroy();
    throw new HttpError(401, "UNAUTHORIZED", "Session invalid or user inactive.");
  }

  if (user.mustChangePassword && !options.allowPasswordChangeRequired) {
    throw new HttpError(
      403,
      "PASSWORD_CHANGE_REQUIRED",
      "Password change is required before accessing this resource."
    );
  }

  request.currentUser = user;
}

export async function requireUser(request: FastifyRequest): Promise<void> {
  return requireUserImpl(request, { allowPasswordChangeRequired: false });
}

export async function requireUserAllowPasswordChange(request: FastifyRequest): Promise<void> {
  return requireUserImpl(request, { allowPasswordChangeRequired: true });
}
