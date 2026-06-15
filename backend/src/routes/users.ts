import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { ActivityAction, Prisma, UserRole, CommissionModel } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { mapUserCreateError } from "../lib/prismaErrors.js";
import { logActivity } from "../services/activityLog.js";
import { destroyPortalSessionsForUser } from "../services/userSessions.js";
import {
  createUserBodySchema,
  patchScraperQuotaBodySchema,
  patchUserBodySchema,
  resetPasswordBodySchema,
  usersListQuerySchema
} from "../validators/schemas.js";
import { grantScraperQuota, ensureUserQuotaRow, getScraperQuotaForUser } from "../services/leadScraper/leadScraperQuota.js";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/users",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const query = usersListQuerySchema.parse(request.query);

      const where =
        query.status === "past"
          ? { archivedAt: { not: null } }
          : { archivedAt: null };

      const total = await app.prisma.user.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const orderBy =
        query.status === "past"
          ? { archivedAt: "desc" as const }
          : { createdAt: "desc" as const };
      const items = await app.prisma.user.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          commissionModel: true,
          isActive: true,
          mustChangePassword: true,
          archivedAt: true,
          createdAt: true,
          updatedAt: true,
          leadScraperQuota: {
            select: {
              monthlyQuota: true,
              searchesUsed: true,
              quotaResetMonth: true
            }
          }
        }
      });

      const config = app.appConfig.leadScraper;
      for (const u of items) {
        if (u.role === UserRole.SALES_REP) {
          await ensureUserQuotaRow(app.prisma, config, u.id);
        }
      }
      const repIds = items.filter((u) => u.role === UserRole.SALES_REP).map((u) => u.id);
      const freshQuotas =
        repIds.length > 0
          ? await app.prisma.leadScraperUserQuota.findMany({
              where: { userId: { in: repIds } }
            })
          : [];
      const quotaByUser = new Map(freshQuotas.map((q) => [q.userId, q]));

      const enriched = items.map((u) => {
        const quota = u.role === UserRole.SALES_REP ? quotaByUser.get(u.id) : null;
        const monthlyQuota = quota?.monthlyQuota ?? config.repDefaultQuota;
        const searchesUsed = quota?.searchesUsed ?? 0;
        return {
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          role: u.role,
          isActive: u.isActive,
          mustChangePassword: u.mustChangePassword,
          archivedAt: u.archivedAt,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          scraperQuota:
            u.role === UserRole.SALES_REP
              ? {
                  monthlyQuota,
                  searchesUsed,
                  remaining: Math.max(0, monthlyQuota - searchesUsed)
                }
              : null
        };
      });

      return reply.send({ items: enriched, total, page, pageSize: query.pageSize });
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
            displayName: body.displayName ?? null,
            role: body.role,
            commissionModel:
              body.role === UserRole.SALES_REP ? body.commissionModel! : null,
            isActive: true,
            mustChangePassword
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            commissionModel: true,
            isActive: true,
            mustChangePassword: true,
            createdAt: true
          }
        });
      } catch (err) {
        mapUserCreateError(err);
        throw err;
      }

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.CREATE,
        entityType: "User",
        entityId: user.id,
        after: { email: user.email, role: user.role, commissionModel: user.commissionModel },
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
          if (existing.archivedAt != null) {
            throw new HttpError(409, "USER_ARCHIVED", "This user was removed and cannot be edited.");
          }

          if (body.isActive === false && id === request.currentUser!.id) {
            throw new HttpError(400, "SELF_DEACTIVATE", "You cannot deactivate your own account.");
          }

          const wouldLoseAdmin =
            existing.role === UserRole.ADMIN &&
            ((body.role !== undefined && body.role !== UserRole.ADMIN) || body.isActive === false);
          if (wouldLoseAdmin) {
            const adminCount = await tx.user.count({
              where: { role: UserRole.ADMIN, isActive: true, archivedAt: null }
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

          const nextRole = body.role ?? existing.role;
          if (nextRole === UserRole.SALES_REP) {
            const nextModel =
              body.commissionModel !== undefined
                ? body.commissionModel
                : existing.commissionModel;
            if (!nextModel) {
              throw new HttpError(
                400,
                "COMMISSION_MODEL_REQUIRED",
                "Commission model is required for sales reps."
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
              ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
              ...(body.commissionModel !== undefined
                ? { commissionModel: body.commissionModel }
                : {}),
              ...(nextRole === UserRole.ADMIN ? { commissionModel: null } : {})
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
              commissionModel: true,
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
          displayName: existing.displayName,
          commissionModel: existing.commissionModel
        },
        after: {
          isActive: updated.isActive,
          role: updated.role,
          displayName: updated.displayName,
          commissionModel: updated.commissionModel
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
      if (existing.archivedAt != null) {
        throw new HttpError(409, "USER_ARCHIVED", "This user was removed and cannot receive a new password.");
      }

      const usedExplicitPassword =
        body.temporaryPassword != null && body.temporaryPassword.length > 0;
      const passwordPlain = usedExplicitPassword
        ? body.temporaryPassword!
        : `Temp-${randomBytes(8).toString("base64url")}!1`;
      const passwordHash = await bcrypt.hash(passwordPlain, app.appConfig.bcryptRounds);
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
          commissionModel: true,
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

      return reply.send({
        user: updated,
        ...(usedExplicitPassword ? {} : { temporaryPassword: passwordPlain })
      });
    }
  );

  app.post(
    "/api/users/:id/archive",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { id } = request.params as { id: string };

      if (id === request.currentUser!.id) {
        throw new HttpError(400, "SELF_ARCHIVE", "You cannot remove your own account.");
      }

      const { existing, updated } = await app.prisma.$transaction(
        async (tx) => {
          const existing = await tx.user.findUnique({ where: { id } });
          if (!existing) {
            throw new HttpError(404, "NOT_FOUND", "User not found.");
          }
          if (existing.archivedAt != null) {
            throw new HttpError(409, "ALREADY_ARCHIVED", "This user is already in Past users.");
          }

          if (existing.role === UserRole.ADMIN) {
            const adminCount = await tx.user.count({
              where: { role: UserRole.ADMIN, isActive: true, archivedAt: null }
            });
            if (adminCount <= 1) {
              throw new HttpError(
                400,
                "LAST_ADMIN",
                "Cannot remove the last active admin."
              );
            }
          }

          const claim = await tx.user.updateMany({
            where: {
              id,
              updatedAt: existing.updatedAt,
              archivedAt: null
            },
            data: {
              archivedAt: new Date(),
              isActive: false
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
              archivedAt: true,
              updatedAt: true
            }
          });
          return { existing, updated };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      await destroyPortalSessionsForUser(app.prisma, id);

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.UPDATE,
        entityType: "User",
        entityId: id,
        before: {
          isActive: existing.isActive,
          archivedAt: existing.archivedAt
        },
        after: {
          isActive: updated.isActive,
          archived: true,
          archivedAt: updated.archivedAt
        },
        request
      });

      return reply.send({ user: updated });
    }
  );

  app.patch(
    "/api/users/:id/scraper-quota",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { id } = request.params as { id: string };
      const body = patchScraperQuotaBodySchema.parse(request.body);

      const target = await app.prisma.user.findUnique({ where: { id } });
      if (!target) {
        throw new HttpError(404, "NOT_FOUND", "User not found.");
      }
      if (target.role !== UserRole.SALES_REP) {
        throw new HttpError(400, "NOT_SALES_REP", "Scraper quota applies to sales reps only.");
      }
      if (!target.isActive || target.archivedAt) {
        throw new HttpError(
          400,
          "INVALID_STATE",
          "Cannot grant scraper quota to an inactive or archived user."
        );
      }

      const config = app.appConfig.leadScraper;
      const result = await grantScraperQuota(app.prisma, config, id, body.amount);
      const quota = await getScraperQuotaForUser(app.prisma, config, id);

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.UPDATE,
        entityType: "User",
        entityId: id,
        after: { scraperQuotaGrant: body.amount, newLimit: result.newLimit },
        request
      });

      return reply.send({
        granted: result.granted,
        newLimit: result.newLimit,
        quota
      });
    }
  );
}
