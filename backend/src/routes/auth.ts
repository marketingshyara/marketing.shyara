import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import { ActivityAction } from "@prisma/client";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "../services/activityLog.js";
import {
  changePasswordBodySchema,
  loginBodySchema
} from "../validators/schemas.js";

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  await app.register(
    async (scope) => {
      await scope.register(rateLimit, {
        max: app.appConfig.loginRateLimitMax,
        timeWindow: app.appConfig.loginRateLimitWindowMs
      });

      scope.post("/login", async (request, reply) => {
        const body = loginBodySchema.parse(request.body);
        const user = await app.prisma.user.findUnique({
          where: { email: body.email.toLowerCase().trim() }
        });

        if (!user || !user.isActive) {
          throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        let valid: boolean;
        try {
          valid = await bcrypt.compare(body.password, user.passwordHash);
        } catch (err) {
          request.log.error({ err }, "bcrypt.compare failed (invalid stored hash?)");
          throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }
        if (!valid) {
          throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        await request.session.regenerate();
        request.session.set("userId", user.id);
        request.session.set("role", user.role);

        await logActivity({
          prisma: app.prisma,
          userId: user.id,
          action: ActivityAction.LOGIN,
          entityType: "User",
          entityId: user.id,
          after: { email: user.email },
          request
        });

        return reply.send({
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            mustChangePassword: user.mustChangePassword
          }
        });
      });
    },
    { prefix: "/api/auth" }
  );

  app.post("/api/auth/logout", { preHandler: [requireUser] }, async (request, reply) => {
    const userId = request.currentUser?.id;
    await logActivity({
      prisma: app.prisma,
      userId: userId ?? null,
      action: ActivityAction.LOGOUT,
      entityType: "User",
      entityId: userId ?? "unknown",
      request
    });
    await request.session.destroy();
    return reply.send({ ok: true });
  });

  app.get("/api/auth/session", async (request, reply) => {
    const userId = request.session.get("userId");
    if (!userId) {
      return reply.send({ user: null });
    }
    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        mustChangePassword: true,
        isActive: true
      }
    });
    if (!user || !user.isActive) {
      await request.session.destroy();
      return reply.send({ user: null });
    }
    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    });
  });

  app.post("/api/auth/change-password", { preHandler: [requireUser] }, async (request, reply) => {
    const body = changePasswordBodySchema.parse(request.body);
    const user = request.currentUser!;

    let valid: boolean;
    try {
      valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    } catch (err) {
      request.log.error({ err }, "bcrypt.compare failed on change-password");
      throw new HttpError(400, "INVALID_PASSWORD", "Current password is incorrect.");
    }
    if (!valid) {
      throw new HttpError(400, "INVALID_PASSWORD", "Current password is incorrect.");
    }

    const passwordHash = await bcrypt.hash(body.newPassword, app.appConfig.bcryptRounds);
    const updated = await app.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    });

    await logActivity({
      prisma: app.prisma,
      userId: user.id,
      action: ActivityAction.PASSWORD_CHANGED,
      entityType: "User",
      entityId: user.id,
      before: { mustChangePassword: user.mustChangePassword },
      after: { mustChangePassword: false },
      request
    });

    return reply.send({
      user: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        role: updated.role,
        mustChangePassword: updated.mustChangePassword
      }
    });
  });
}
