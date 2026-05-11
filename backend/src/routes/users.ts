import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { ActivityAction, Prisma, UserRole } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { mapUserCreateError } from "../lib/prismaErrors.js";
import { logActivity } from "../services/activityLog.js";
import {
  createUserBodySchema,
  patchUserBodySchema,
  resetPasswordBodySchema,
  usersListQuerySchema
} from "../validators/schemas.js";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/users",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const query = usersListQuerySchema.parse(request.query);

      const total = await app.prisma.user.count();
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.user.findMany({
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );

  app.post(
    "/api/users",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const body = createUserBodySchema.parse(request.body);
      const email = body.email.toLowerCase().trim();

      const usedExplicitPassword = body.password != null && body.password.length > 0;
      const passwordPlain =
        usedExplicitPassword ? body.password! : `Temp-${randomBytes(8).toString("base64url")}!1`;
      const passwordHash = await bcrypt.hash(passwordPlain, app.appConfig.bcryptRounds);
      const mustChangePassword = usedExplicitPassword ? (body.mustChangePassword ?? false) : true;

      let user;
      try {
        user = await app.prisma.user.create({
          data: {
            email,
            passwordHash,
            displayName: body.displayName,
            role: body.role,
            mustChangePassword
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true
          }
        });
      } catch (err) {
        mapUserCreateError(err);
      }

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.CREATE,
        entityType: "User",
        entityId: user.id,
        after: { email: user.email, role: user.role },
        request
      });

      return reply.status(201).send({
        user,
        ...(usedExplicitPassword ? {} : { temporaryPassword: passwordPlain })
      });
    }
  );

  app.patch(
    "/api/users/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { id } = request.params as { id: string };
      const body = patchUserBodySchema.parse(request.body);

      const { existing, updated } = await app.prisma.$transaction(
        async (tx) => {
          const existing = await tx.user.findUnique({ where: { id } });
          if (!existing) {
            throw new HttpError(404, "NOT_FOUND", "User not found.");
          }

          if (body.isActive === false && id === request.currentUser!.id) {
            throw new HttpError(400, "SELF_DEACTIVATE", "You cannot deactivate your own account.");
          }

          const wouldLoseAdmin =
            existing.role === UserRole.ADMIN &&
            ((body.role !== undefined && body.role !== UserRole.ADMIN) || body.isActive === false);
          if (wouldLoseAdmin) {
            const adminCount = await tx.user.count({
              where: { role: UserRole.ADMIN, isActive: true }
            });
            if (adminCount <= 1) {
              throw new HttpError(
                400,
                "LAST_ADMIN",
                body.isActive === false
                  ? "Cannot deactivate the last active admin."
                  : "Cannot remove the last admin role."
              );
            }
          }

          const claim = await tx.user.updateMany({
            where: {
              id,
              updatedAt: existing.updatedAt
            },
            data: {
              ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
              ...(body.role !== undefined ? { role: body.role } : {}),
              ...(body.displayName !== undefined ? { displayName: body.displayName } : {})
            }
          });
          if (claim.count === 0) {
            throw new HttpError(
              409,
              "CONCURRENT_MODIFICATION",
              "User was modified concurrently; refresh and retry."
            );
          }

          const updated = await tx.user.findUniqueOrThrow({
            where: { id },
            select: {
              id: true,
              email: true,
              displayName: true,
              role: true,
              isActive: true,
              mustChangePassword: true,
              updatedAt: true
            }
          });
          return { existing, updated };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.UPDATE,
        entityType: "User",
        entityId: id,
        before: {
          isActive: existing.isActive,
          role: existing.role,
          displayName: existing.displayName
        },
        after: {
          isActive: updated.isActive,
          role: updated.role,
          displayName: updated.displayName
        },
        request
      });

      return reply.send({ user: updated });
    }
  );

  app.post(
    "/api/users/:id/reset-password",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { id } = request.params as { id: string };
      const body = resetPasswordBodySchema.parse(request.body);

      const existing = await app.prisma.user.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpError(404, "NOT_FOUND", "User not found.");
      }

      const passwordHash = await bcrypt.hash(body.temporaryPassword, app.appConfig.bcryptRounds);
      const claim = await app.prisma.user.updateMany({
        where: { id, updatedAt: existing.updatedAt },
        data: {
          passwordHash,
          mustChangePassword: true
        }
      });
      if (claim.count === 0) {
        throw new HttpError(
          409,
          "CONCURRENT_MODIFICATION",
          "User was modified concurrently; refresh and retry."
        );
      }

      const updated = await app.prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          updatedAt: true
        }
      });

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.UPDATE,
        entityType: "User",
        entityId: id,
        after: { resetPassword: true },
        request
      });

      return reply.send({ user: updated });
    }
  );
}
