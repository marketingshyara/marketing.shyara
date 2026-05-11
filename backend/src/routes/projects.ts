import type { FastifyInstance } from "fastify";
import { ActivityAction, LeadStatus, Prisma, UserRole } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { divideCentsWithRounding } from "../lib/money.js";
import { getCommissionRepUserId } from "../services/commissionRep.js";
import { assertLeadAccess } from "../services/leadAccess.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings } from "../services/settings.js";
import {
  createProjectBodySchema,
  paginationQuerySchema,
  patchProjectBodySchema,
  repSubmitDeploymentBodySchema
} from "../validators/schemas.js";

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
        if (body.title !== undefined) data.title = body.title;
        if (body.metadata !== undefined) {
          data.metadata = (body.metadata ?? undefined) as Prisma.InputJsonValue | undefined;
        }
        if (body.previewUrl !== undefined) data.previewUrl = body.previewUrl ?? undefined;
        if (body.deployedUrl !== undefined) data.deployedUrl = body.deployedUrl ?? undefined;
        if (body.markDeploymentSubmitted === true) {
          const url = body.deployedUrl ?? existing.deployedUrl;
          if (!url) {
            throw new HttpError(
              400,
              "DEPLOYMENT_URL_REQUIRED",
              "Set deployedUrl before marking deployment submitted."
            );
          }
          data.deploymentSubmittedAt = new Date();
          if (body.deployedUrl !== undefined) data.deployedUrl = body.deployedUrl;
        }
      } else {
        const body = repSubmitDeploymentBodySchema.parse(request.body);
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

      return reply.send({ project });
    }
  );

  app.post(
    "/api/projects/:id/verify-deployment",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { id } = request.params as { id: string };

      const outcome = await app.prisma.$transaction(
        async (tx) => {
          const project = await tx.project.findUnique({
            where: { id },
            include: { lead: true }
          });
          if (!project) {
            throw new HttpError(404, "NOT_FOUND", "Project not found.");
          }
          if (!project.deploymentSubmittedAt) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Deployment has not been submitted for this project."
            );
          }
          if (project.deploymentVerifiedAt) {
            throw new HttpError(400, "ALREADY_PROCESSED", "Deployment was already verified.");
          }

          const lead = project.lead;
          if (lead.status === LeadStatus.FINAL_PAID) {
            const leadClaim = await tx.lead.updateMany({
              where: { id: lead.id, status: LeadStatus.FINAL_PAID },
              data: { status: LeadStatus.DEPLOYED }
            });
            if (leadClaim.count === 0) {
              throw new HttpError(
                409,
                "CONCURRENT_MODIFICATION",
                "Lead state changed concurrently; refresh and retry."
              );
            }
          } else if (lead.status !== LeadStatus.DEPLOYED) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Lead must be FINAL_PAID or DEPLOYED before deployment can be verified."
            );
          }

          const projectClaim = await tx.project.updateMany({
            where: {
              id,
              deploymentVerifiedAt: null,
              deploymentSubmittedAt: { not: null }
            },
            data: { deploymentVerifiedAt: new Date() }
          });
          if (projectClaim.count === 0) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Deployment must be submitted and not already verified."
            );
          }

          const freshLead = await tx.lead.findUniqueOrThrow({ where: { id: lead.id } });
          const settings = await getPortalSettings(tx);
          if (freshLead.agreedTotalCents == null || freshLead.agreedTotalCents <= 0) {
            throw new HttpError(
              400,
              "AGREED_TOTAL_REQUIRED",
              "Set the agreed project total on the lead before verifying deployment."
            );
          }
          const repId = getCommissionRepUserId(freshLead);
          const amountCents = divideCentsWithRounding(
            freshLead.agreedTotalCents * settings.commissionRateBps,
            10000,
            settings.commissionRounding
          );
          await tx.commission.upsert({
            where: { leadId: freshLead.id },
            create: {
              leadId: freshLead.id,
              repUserId: repId,
              amountCents
            },
            update: {
              repUserId: repId,
              amountCents
            }
          });

          const updatedProject = await tx.project.findUniqueOrThrow({ where: { id } });
          const updatedLead = await tx.lead.findUniqueOrThrow({ where: { id: lead.id } });

          await logActivity({
            prisma: app.prisma,
            tx,
            userId: admin.id,
            action: ActivityAction.UPDATE,
            entityType: "Project",
            entityId: id,
            after: {
              deploymentVerifiedAt: updatedProject.deploymentVerifiedAt,
              leadStatus: updatedLead.status
            },
            request
          });

          return { project: updatedProject, lead: updatedLead };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 15000
        }
      );

      return reply.send(outcome);
    }
  );
}
