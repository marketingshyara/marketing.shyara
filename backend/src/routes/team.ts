import type { FastifyInstance } from "fastify";
import { LeadStatus, PaymentVerificationStatus, UserRole } from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";

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
          const [activeLeads, pendingVerifications] = await Promise.all([
            app.prisma.lead.count({
              where: { assignedToUserId: r.id, status: { not: LeadStatus.COMMISSION_PAID } }
            }),
            app.prisma.leadPayment.count({
              where: {
                verificationStatus: PaymentVerificationStatus.PENDING,
                lead: { assignedToUserId: r.id }
              }
            })
          ]);
          return { ...r, activeLeads, pendingVerifications };
        })
      );
      return reply.send({ items });
    }
  );

  app.get(
    "/api/team/reps/:userId",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const { userId } = request.params as { userId: string };
      const rep = await app.prisma.user.findFirst({
        where: { id: userId, role: UserRole.SALES_REP, isActive: true },
        select: { id: true, email: true, displayName: true }
      });
      if (!rep) {
        throw new HttpError(404, "NOT_FOUND", "Sales rep not found.");
      }
      const [activeLeads, pendingVerifications] = await Promise.all([
        app.prisma.lead.count({
          where: { assignedToUserId: rep.id, status: { not: LeadStatus.COMMISSION_PAID } }
        }),
        app.prisma.leadPayment.count({
          where: {
            verificationStatus: PaymentVerificationStatus.PENDING,
            lead: { assignedToUserId: rep.id }
          }
        })
      ]);
      const recentLeads = await app.prisma.lead.findMany({
        where: { assignedToUserId: rep.id },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          clientName: true,
          status: true,
          createdAt: true,
          agreedTotalCents: true
        }
      });
      return reply.send({
        rep: { ...rep, activeLeads, pendingVerifications },
        recentLeads
      });
    }
  );
}
