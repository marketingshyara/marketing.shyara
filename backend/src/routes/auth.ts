import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import { ActivityAction } from "@prisma/client";
import { requireUser, requireUserAllowPasswordChange } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { DUMMY_BCRYPT_HASH, safeBcryptCompare } from "../lib/bcrypt.js";
import {
  isLocked,
  recordLoginFailure,
  recordLoginSuccess,
  remainingLockSeconds
} from "../lib/loginLockout.js";
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
        const lockoutConfig = {
          threshold: app.appConfig.loginLockoutThreshold,
          windowSeconds: app.appConfig.loginLockoutWindowSeconds
        };

        const user = await app.prisma.user.findUnique({
          where: { email: body.email.toLowerCase().trim() }
        });

        // Always run bcrypt - even on missing user - so timing doesn't reveal account existence.
        const hash = user?.passwordHash ?? DUMMY_BCRYPT_HASH;
        const passwordOk = await safeBcryptCompare(body.password, hash, request);

        if (!user || !user.isActive) {
          throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        // Lockout check after bcrypt: if the account is currently locked we surface a generic
        // INVALID_CREDENTIALS (don't reveal the lock state to attackers) but include Retry-After
        // so legitimate clients can back off gracefully.
        if (isLocked(user)) {
          const retryAfter = remainingLockSeconds(user);
          reply.header("Retry-After", String(Math.max(1, retryAfter)));
          throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        if (!passwordOk) {
          // Fire and forget the counter increment; never block the response on it.
          await recordLoginFailure(app.prisma, user.id, lockoutConfig).catch((err) => {
            request.log.warn({ err }, "recordLoginFailure failed");
          });
          throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        await recordLoginSuccess(app.prisma, user.id).catch((err) => {
          request.log.warn({ err }, "recordLoginSuccess failed");
        });

        await request.session.regenerate();
        const sessionMaxAgeMs = body.rememberDevice
          ? app.appConfig.sessionRememberMeMaxAgeSeconds * 1000
          : app.appConfig.sessionMaxAgeSeconds * 1000;
        request.session.options({ maxAge: sessionMaxAgeMs });
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

  app.post("/api/auth/logout", { preHandler: [requireUserAllowPasswordChange] }, async (request, reply) => {
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

  app.post("/api/auth/change-password", { preHandler: [requireUserAllowPasswordChange] }, async (request, reply) => {
    const body = changePasswordBodySchema.parse(request.body);
    const user = request.currentUser!;

    const valid = await safeBcryptCompare(body.currentPassword, user.passwordHash, request);
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
