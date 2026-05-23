import type { FastifyInstance } from "fastify";
import { ActivityAction, Prisma, UserRole } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { assertLeadAccess } from "../services/leadAccess.js";
import { logActivity } from "../services/activityLog.js";
import {
  createProjectBodySchema,
  paginationQuerySchema,
  patchProjectBodySchema,
  repSubmitDeploymentBodySchema
} from "../validators/schemas.js";
import { notifyActiveAdmins } from "../services/notifications.js";
import { stageDeclineNotesAfterClear } from "../services/stageDeclineNotes.js";
import { PortalNotificationKind } from "@prisma/client";
import { assertRepDeploymentPatchAllowed } from "../services/stageLocks.js";

export async function registerProjectRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/projects",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const query = paginationQuerySchema.parse(request.query);

      const where =
        user.role === UserRole.ADMIN
          ? {}
          : {
              lead: {
                OR: [{ createdByUserId: user.id }, { assignedToUserId: user.id }]
              }
            };

      const total = await app.prisma.project.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.project.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              clientName: true,
              status: true,
              createdByUserId: true,
              assignedToUserId: true
            }
          }
        }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );

  app.get(
    "/api/projects/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };

      // Scope the lookup so non-members get a uniform 404 (no existence enumeration via 403).
      const project =
        user.role === UserRole.ADMIN
          ? await app.prisma.project.findUnique({
              where: { id },
              include: { lead: true }
            })
          : await app.prisma.project.findFirst({
              where: {
                id,
                lead: {
                  OR: [{ createdByUserId: user.id }, { assignedToUserId: user.id }]
                }
              },
              include: { lead: true }
            });
      if (!project) {
        throw new HttpError(404, "NOT_FOUND", "Project not found.");
      }
      return reply.send({ project });
    }
  );

  app.post(
    "/api/projects",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const body = createProjectBodySchema.parse(request.body);

      const lead = await app.prisma.lead.findUnique({ where: { id: body.leadId } });
      if (!lead) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }

      const existing = await app.prisma.project.findUnique({ where: { leadId: body.leadId } });
      if (existing) {
        throw new HttpError(409, "PROJECT_EXISTS", "A project already exists for this lead.");
      }

      const project = await app.prisma.project.create({
        data: {
          leadId: body.leadId,
          title: body.title,
          metadata: (body.metadata ?? undefined) as Prisma.InputJsonValue | undefined
        }
      });

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.CREATE,
        entityType: "Project",
        entityId: project.id,
        after: { leadId: body.leadId, title: body.title },
        request
      });

      return reply.status(201).send({ project });
    }
  );

  app.patch(
    "/api/projects/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };

      const existing = await app.prisma.project.findUnique({
        where: { id },
        include: { lead: true }
      });
      if (!existing) {
        throw new HttpError(404, "NOT_FOUND", "Project not found.");
      }
      assertLeadAccess(existing.lead, user);

      const data: Prisma.ProjectUncheckedUpdateManyInput = {};

      if (user.role === UserRole.ADMIN) {
        const body = patchProjectBodySchema.parse(request.body);
        if (body.deployedUrl !== undefined || body.markDeploymentSubmitted === true) {
          throw new HttpError(
            403,
            "FORBIDDEN",
            "Admins cannot submit deployment; sales reps submit the live URL for verification."
          );
        }
        if (body.title !== undefined) data.title = body.title;
        if (body.metadata !== undefined) {
          data.metadata = (body.metadata ?? undefined) as Prisma.InputJsonValue | undefined;
        }
        if (body.previewUrl !== undefined) data.previewUrl = body.previewUrl ?? undefined;
      } else {
        const body = repSubmitDeploymentBodySchema.parse(request.body);
        if (!existing.lead.repoTransferVerifiedAt) {
          throw new HttpError(
            400,
            "INVALID_STATE",
            "Admin must verify repository transfer before you submit the live URL."
          );
        }
        assertRepDeploymentPatchAllowed(existing);
        data.deployedUrl = body.deployedUrl;
        data.deploymentSubmittedAt = new Date();
      }

      if (Object.keys(data).length === 0) {
        return reply.send({ project: existing });
      }

      const claim = await app.prisma.project.updateMany({
        where: { id, updatedAt: existing.updatedAt },
        data
      });
      if (claim.count === 0) {
        throw new HttpError(
          409,
          "CONCURRENT_MODIFICATION",
          "Project was modified concurrently; refresh and retry."
        );
      }

      const project = await app.prisma.project.findUniqueOrThrow({ where: { id } });

      await logActivity({
        prisma: app.prisma,
        userId: user.id,
        action: ActivityAction.UPDATE,
        entityType: "Project",
        entityId: id,
        before: {
          title: existing.title,
          previewUrl: existing.previewUrl,
          deployedUrl: existing.deployedUrl,
          deploymentSubmittedAt: existing.deploymentSubmittedAt
        },
        after: {
          title: project.title,
          previewUrl: project.previewUrl,
          deployedUrl: project.deployedUrl,
          deploymentSubmittedAt: project.deploymentSubmittedAt
        },
        request
      });

      if (user.role === UserRole.SALES_REP && project.deploymentSubmittedAt) {
        const lead = await app.prisma.lead.findUnique({ where: { id: project.leadId } });
        if (lead) {
          await app.prisma.lead.updateMany({
            where: { id: project.leadId },
            data: {
              stageDeclineNotes: stageDeclineNotesAfterClear(
                lead,
                "deployment_verify",
                "deployment_submit"
              )
            }
          });
          await notifyActiveAdmins(app.prisma, {
            leadId: project.leadId,
            kind: PortalNotificationKind.REP_SUBMITTED,
            stageKey: "deployment_submit",
            message: `${lead.clientName}: live deployment URL submitted.`,
            excludeUserId: user.id
          });
        }
      }

      return reply.send({ project });
    }
  );

  app.post(
    "/api/projects/:id/verify-deployment",
    { preHandler: [requireUser] },
    async (_request, _reply) => {
      requireAdmin(_request);
      throw new HttpError(
        410,
        "DEPRECATED_ENDPOINT",
        "Use POST /api/leads/:leadId/stages/deployment/verify instead."
      );
    }
  );
}
