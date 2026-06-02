import type { FastifyInstance } from "fastify";
import { LeadStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { clampPage } from "../lib/pagination.js";
import { getPipelineStages, summarizePipelineStages } from "../services/pipeline.js";
import { getPortalSettings } from "../services/settings.js";

const adminProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["active", "completed", "all"]).optional().default("all")
});

export async function registerAdminProjectsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/admin/projects",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const query = adminProjectsQuerySchema.parse(request.query);
      const settings = await getPortalSettings(app.prisma);

      const statusFilter =
        query.status === "completed"
          ? { status: LeadStatus.COMMISSION_PAID }
          : query.status === "active"
            ? { status: { not: LeadStatus.COMMISSION_PAID } }
            : {};

      const where = {
        convertedAt: { not: null },
        ...statusFilter,
        ...(query.search
          ? { clientName: { contains: query.search, mode: "insensitive" as const } }
          : {})
      };

      const total = await app.prisma.lead.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;

      const leads = await app.prisma.lead.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              displayName: true,
              archivedAt: true
            }
          },
          project: true,
          payments: { orderBy: { markedAt: "desc" } }
        }
      });

      const items = leads.map((lead) => {
        const pipelineStages = getPipelineStages(lead, settings, UserRole.ADMIN);
        const summary = summarizePipelineStages(pipelineStages);
        const rep = lead.assignedTo;
        return {
          id: lead.id,
          clientName: lead.clientName,
          status: lead.status,
          agreedTotalCents: lead.agreedTotalCents,
          convertedAt: lead.convertedAt,
          updatedAt: lead.updatedAt,
          assignedToUserId: lead.assignedToUserId,
          rep: rep
            ? {
                id: rep.id,
                email: rep.email,
                displayName: rep.displayName,
                archivedAt: rep.archivedAt
              }
            : null,
          currentStageKey: summary.currentStageKey,
          currentStageTitle: summary.currentStageTitle,
          pendingAdmin: summary.pendingAdmin
        };
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );
}
