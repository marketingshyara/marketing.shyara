import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { ActivityAction, UserRole } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { logActivity } from "../services/activityLog.js";
import { createProjectBodySchema, paginationQuerySchema, patchProjectBodySchema } from "../validators/schemas.js";

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
      requireAdmin(request);
      const { id } = request.params as { id: string };
      const body = patchProjectBodySchema.parse(request.body);

      const existing = await app.prisma.project.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpError(404, "NOT_FOUND", "Project not found.");
      }

      const data: Prisma.ProjectUncheckedUpdateManyInput = {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.metadata !== undefined
          ? { metadata: (body.metadata ?? undefined) as Prisma.InputJsonValue | undefined }
          : {})
      };
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
        userId: request.currentUser!.id,
        action: ActivityAction.UPDATE,
        entityType: "Project",
        entityId: id,
        before: { title: existing.title },
        after: { title: project.title },
        request
      });

      return reply.send({ project });
    }
  );
}
