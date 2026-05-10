import type { FastifyInstance } from "fastify";
import { ActivityAction, LeadStatus, UserRole } from "@prisma/client";
import { clampPage } from "../lib/pagination.js";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "../services/activityLog.js";
import { commissionsListQuerySchema, patchCommissionBodySchema } from "../validators/schemas.js";

export async function registerCommissionRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/commissions",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const query = commissionsListQuerySchema.parse(request.query);

      const where =
        user.role === UserRole.ADMIN
          ? {
              ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {})
            }
          : {
              repUserId: user.id,
              ...(query.isPaid !== undefined ? { isPaid: query.isPaid } : {})
            };

      const total = await app.prisma.commission.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.commission.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              clientName: true,
              status: true
            }
          }
        }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );

  app.patch(
    "/api/commissions/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { id } = request.params as { id: string };
      const body = patchCommissionBodySchema.parse(request.body);

      const existing = await app.prisma.commission.findUnique({
        where: { id },
        include: { lead: true }
      });
      if (!existing) {
        throw new HttpError(404, "NOT_FOUND", "Commission not found.");
      }
      if (existing.isPaid) {
        throw new HttpError(400, "ALREADY_PAID", "Cannot change amount after commission is paid.");
      }
      if (existing.lead.status === LeadStatus.COMMISSION_PAID) {
        throw new HttpError(400, "LEAD_TERMINAL", "Lead is already commission-paid.");
      }

      const updated = await app.prisma.commission.update({
        where: { id },
        data: { amountCents: body.amountCents }
      });

      await logActivity({
        prisma: app.prisma,
        userId: request.currentUser!.id,
        action: ActivityAction.UPDATE,
        entityType: "Commission",
        entityId: id,
        before: { amountCents: existing.amountCents },
        after: { amountCents: updated.amountCents },
        request
      });

      return reply.send({ commission: updated });
    }
  );

  app.post(
    "/api/commissions/:id/mark-paid",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { id } = request.params as { id: string };

      const outcome = await app.prisma.$transaction(async (tx) => {
        const commission = await tx.commission.findUnique({
          where: { id },
          include: { lead: true }
        });
        if (!commission) {
          throw new HttpError(404, "NOT_FOUND", "Commission not found.");
        }
        if (commission.isPaid) {
          throw new HttpError(400, "ALREADY_PAID", "Commission is already marked paid.");
        }
        if (commission.lead.status !== LeadStatus.DEPLOYED) {
          throw new HttpError(
            400,
            "INVALID_STATE",
            "Lead must be DEPLOYED before commission can be marked paid."
          );
        }

        const updatedCommission = await tx.commission.update({
          where: { id },
          data: {
            isPaid: true,
            paidAt: new Date(),
            paidByAdminId: admin.id
          }
        });

        const updatedLead = await tx.lead.update({
          where: { id: commission.leadId },
          data: { status: LeadStatus.COMMISSION_PAID }
        });

        return { commission: updatedCommission, lead: updatedLead };
      });

      await logActivity({
        prisma: app.prisma,
        userId: admin.id,
        action: ActivityAction.COMMISSION_PAID,
        entityType: "Commission",
        entityId: id,
        after: { isPaid: true, leadStatus: outcome.lead.status },
        request
      });

      return reply.send(outcome);
    }
  );
}
