import type { FastifyInstance } from "fastify";
import { LeadStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { getPipelineStages, summarizePipelineStages } from "../services/pipeline.js";
import { getPortalSettings } from "../services/settings.js";
import { getRepDashboardStats } from "../services/teamStats.js";

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
        where: { role: UserRole.SALES_REP, isActive: true },
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

      const rep = await app.prisma.user.findFirst({
        where: { id: userId, role: UserRole.SALES_REP, isActive: true },
        select: { id: true, email: true, displayName: true }
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
}
