import type { FastifyInstance } from "fastify";
import { LeadStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { getPipelineStages, summarizePipelineStages } from "../services/pipeline.js";
import { getPortalSettings } from "../services/settings.js";
import { getRepDashboardStats } from "../services/teamStats.js";
import { teamRepLeadsQuerySchema } from "../validators/schemas.js";

function repLeadDisposition(lead: {
  convertedAt: Date | null;
  notInterestedAt: Date | null;
  status: LeadStatus;
}): "prospect" | "not_interested" | "client" | "settled" {
  if (lead.convertedAt == null) {
    return lead.notInterestedAt != null ? "not_interested" : "prospect";
  }
  return lead.status === LeadStatus.COMMISSION_PAID ? "settled" : "client";
}

const repProjectsQuerySchema = z.object({
  status: z.enum(["active", "all", "completed"]).optional().default("active")
});

export async function registerTeamRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/team/reps",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const reps = await app.prisma.user.findMany({
        where: { role: UserRole.SALES_REP, isActive: true, archivedAt: null },
        orderBy: [{ displayName: "asc" }, { email: "asc" }],
        select: { id: true, email: true, displayName: true }
      });
      const items = await Promise.all(
        reps.map(async (r) => {
          const stats = await getRepDashboardStats(app.prisma, r.id);
          return {
            ...r,
            ...stats,
            /** @deprecated use pendingPayments */
            pendingVerifications: stats.pendingPayments,
            activeLeads: stats.activeClients
          };
        })
      );
      items.sort((a, b) => b.needsAdminAction - a.needsAdminAction);
      return reply.send({ items });
    }
  );

  app.get(
    "/api/team/reps/:userId",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { userId } = request.params as { userId: string };
      const query = repProjectsQuerySchema.parse(request.query);

      // Include archived reps so admins can open historical projects (Team list stays active-only).
      const rep = await app.prisma.user.findFirst({
        where: { id: userId, role: UserRole.SALES_REP },
        select: {
          id: true,
          email: true,
          displayName: true,
          archivedAt: true,
          isActive: true
        }
      });
      if (!rep) {
        throw new HttpError(404, "NOT_FOUND", "Sales rep not found.");
      }

      const stats = await getRepDashboardStats(app.prisma, rep.id);
      const settings = await getPortalSettings(app.prisma);

      const statusFilter =
        query.status === "completed"
          ? { status: LeadStatus.COMMISSION_PAID }
          : query.status === "active"
            ? { status: { not: LeadStatus.COMMISSION_PAID } }
            : {};

      const leads = await app.prisma.lead.findMany({
        where: {
          assignedToUserId: rep.id,
          convertedAt: { not: null },
          ...statusFilter
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: {
          payments: { orderBy: { markedAt: "desc" } },
          project: true,
          commission: true
        }
      });

      const projects = leads.map((lead) => {
        const pipelineStages = getPipelineStages(lead, settings, UserRole.ADMIN);
        const summary = summarizePipelineStages(pipelineStages);
        return {
          id: lead.id,
          clientName: lead.clientName,
          status: lead.status,
          agreedTotalCents: lead.agreedTotalCents,
          convertedAt: lead.convertedAt,
          currentStageKey: summary.currentStageKey,
          currentStageTitle: summary.currentStageTitle,
          pendingAdmin: summary.pendingAdmin,
          pipelineStages
        };
      });

      return reply.send({
        rep: {
          ...rep,
          ...stats,
          pendingVerifications: stats.pendingPayments,
          activeLeads: stats.activeClients
        },
        projects
      });
    }
  );

  app.get(
    "/api/team/reps/:userId/leads",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { userId } = request.params as { userId: string };
      const query = teamRepLeadsQuerySchema.parse(request.query);

      const rep = await app.prisma.user.findFirst({
        where: { id: userId, role: UserRole.SALES_REP },
        select: { id: true }
      });
      if (!rep) {
        throw new HttpError(404, "NOT_FOUND", "Sales rep not found.");
      }

      const settings = await getPortalSettings(app.prisma);
      const search = query.search?.trim();
      const createdAtFilter =
        query.from || query.to
          ? {
              createdAt: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {})
              }
            }
          : {};

      const where = {
        assignedToUserId: rep.id,
        ...createdAtFilter,
        ...(search
          ? {
              OR: [
                { clientName: { contains: search, mode: "insensitive" as const } },
                { clientEmail: { contains: search, mode: "insensitive" as const } },
                { clientPhone: { contains: search, mode: "insensitive" as const } }
              ]
            }
          : {})
      };

      const [total, leads] = await Promise.all([
        app.prisma.lead.count({ where }),
        app.prisma.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          include: {
            payments: { orderBy: { markedAt: "desc" } },
            project: true
          }
        })
      ]);

      const items = leads.map((lead) => {
        const disposition = repLeadDisposition(lead);
        const pipelineSummary =
          lead.convertedAt != null
            ? summarizePipelineStages(getPipelineStages(lead, settings, UserRole.ADMIN))
            : null;
        return {
          id: lead.id,
          clientName: lead.clientName,
          status: lead.status,
          createdAt: lead.createdAt,
          convertedAt: lead.convertedAt,
          notInterestedAt: lead.notInterestedAt,
          notInterestedNote: lead.notInterestedNote,
          disposition,
          pipelineSummary
        };
      });

      return reply.send({
        items,
        page: query.page,
        pageSize: query.pageSize,
        total
      });
    }
  );
}
