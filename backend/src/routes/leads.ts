import type { FastifyInstance } from "fastify";
import { ActivityAction, LeadStatus, PaymentKind, PaymentVerificationStatus, UserRole } from "@prisma/client";
import type { User } from "@prisma/client";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { clampPage } from "../lib/pagination.js";
import { getCommissionRepUserId } from "../services/commissionRep.js";
import { assertManualTransition, commissionAmountCents } from "../services/leadFsm.js";
import { assertLeadAccess } from "../services/leadAccess.js";
import { assertLeadMutableForOp } from "../services/leadGuards.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings, getRequiredLeadStatusForPaymentKind } from "../services/settings.js";
import {
  createLeadBodySchema,
  leadsListQuerySchema,
  markPaymentBodySchema,
  patchLeadBodySchema,
  transitionBodySchema
} from "../validators/schemas.js";

function repLeadScope(userId: string) {
  return {
    OR: [{ createdByUserId: userId }, { assignedToUserId: userId }]
  };
}

async function resolveAssignedRepForCreate(
  prisma: FastifyInstance["prisma"],
  user: User,
  body: { assignedToUserId?: string | null }
): Promise<string | null> {
  if (user.role === UserRole.ADMIN) {
    if (!body.assignedToUserId) {
      throw new HttpError(
        400,
        "ASSIGNMENT_REQUIRED",
        "Admin must set assignedToUserId to an active sales rep."
      );
    }
    const assignee = await prisma.user.findUnique({ where: { id: body.assignedToUserId } });
    if (!assignee?.isActive || assignee.role !== UserRole.SALES_REP) {
      throw new HttpError(400, "INVALID_ASSIGNEE", "Assignee must be an active sales rep.");
    }
    return assignee.id;
  }
  if (body.assignedToUserId && body.assignedToUserId !== user.id) {
    throw new HttpError(403, "FORBIDDEN", "Sales reps cannot assign leads to another user.");
  }
  return user.id;
}

export async function registerLeadRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/leads",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const query = leadsListQuerySchema.parse(request.query);

      const filters = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.search
          ? {
              OR: [
                { clientName: { contains: query.search, mode: "insensitive" as const } },
                { clientEmail: { contains: query.search, mode: "insensitive" as const } },
                { clientPhone: { contains: query.search, mode: "insensitive" as const } }
              ]
            }
          : {}),
        ...(query.from || query.to
          ? {
              createdAt: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {})
              }
            }
          : {})
      };

      const where =
        user.role === UserRole.ADMIN
          ? filters
          : {
              ...repLeadScope(user.id),
              ...filters
            };

      const total = await app.prisma.lead.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.lead.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" }
      });

      return reply.send({ items, total, page, pageSize: query.pageSize });
    }
  );

  app.post(
    "/api/leads",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const body = createLeadBodySchema.parse(request.body);

      const assignedToUserId = await resolveAssignedRepForCreate(app.prisma, user, body);

      const lead = await app.prisma.lead.create({
        data: {
          createdByUserId: user.id,
          assignedToUserId,
          clientName: body.clientName,
          clientEmail: body.clientEmail ?? undefined,
          clientPhone: body.clientPhone ?? undefined,
          notes: body.notes ?? undefined,
          advanceAmountCents: body.advanceAmountCents ?? undefined,
          finalQuoteCents: body.finalQuoteCents ?? undefined,
          status: LeadStatus.NEW
        }
      });

      await logActivity({
        prisma: app.prisma,
        userId: user.id,
        action: ActivityAction.CREATE,
        entityType: "Lead",
        entityId: lead.id,
        after: {
          status: lead.status,
          clientName: lead.clientName,
          assignedToUserId: lead.assignedToUserId
        },
        request
      });

      return reply.status(201).send({ lead });
    }
  );

  app.get(
    "/api/leads/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const lead = await app.prisma.lead.findUnique({
        where: { id },
        include: {
          payments: { orderBy: { markedAt: "desc" } },
          commission: true,
          project: true
        }
      });
      if (!lead) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }
      assertLeadAccess(lead, user);
      return reply.send({ lead });
    }
  );

  app.patch(
    "/api/leads/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const body = patchLeadBodySchema.parse(request.body);

      const lead = await app.prisma.lead.findUnique({ where: { id } });
      if (!lead) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }
      assertLeadAccess(lead, user);
      const settings = await getPortalSettings(app.prisma);
      assertLeadMutableForOp(lead, settings, "PATCH_FIELDS");

      let assignedToUserId: string | null | undefined = undefined;
      if (body.assignedToUserId !== undefined) {
        if (user.role !== UserRole.ADMIN) {
          throw new HttpError(403, "FORBIDDEN", "Only admins can change lead assignment.");
        }
        if (body.assignedToUserId === null) {
          assignedToUserId = null;
        } else {
          const assignee = await app.prisma.user.findUnique({ where: { id: body.assignedToUserId } });
          if (!assignee?.isActive || assignee.role !== UserRole.SALES_REP) {
            throw new HttpError(400, "INVALID_ASSIGNEE", "Assignee must be an active sales rep.");
          }
          assignedToUserId = assignee.id;
        }
      }

      const updated = await app.prisma.lead.update({
        where: { id },
        data: {
          ...(body.clientName !== undefined ? { clientName: body.clientName } : {}),
          ...(body.clientEmail !== undefined ? { clientEmail: body.clientEmail } : {}),
          ...(body.clientPhone !== undefined ? { clientPhone: body.clientPhone } : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
          ...(body.advanceAmountCents !== undefined ? { advanceAmountCents: body.advanceAmountCents } : {}),
          ...(body.finalQuoteCents !== undefined ? { finalQuoteCents: body.finalQuoteCents } : {}),
          ...(assignedToUserId !== undefined ? { assignedToUserId } : {})
        }
      });

      const commission = await app.prisma.commission.findUnique({ where: { leadId: id } });
      if (commission && !commission.isPaid) {
        const commissionUpdate: { repUserId?: string; amountCents?: number } = {};
        if (assignedToUserId !== undefined) {
          const nextRepUserId = getCommissionRepUserId(updated);
          if (commission.repUserId !== nextRepUserId) {
            commissionUpdate.repUserId = nextRepUserId;
          }
        }
        if (body.finalQuoteCents !== undefined && settings.commissionBasis === "FINAL_QUOTE") {
          const amountCents = commissionAmountCents(updated, 0, settings);
          if (amountCents !== commission.amountCents) {
            commissionUpdate.amountCents = amountCents;
          }
        }
        if (Object.keys(commissionUpdate).length > 0) {
          await app.prisma.commission.update({
            where: { leadId: id },
            data: commissionUpdate
          });
        }
      }

      await logActivity({
        prisma: app.prisma,
        userId: user.id,
        action: ActivityAction.UPDATE,
        entityType: "Lead",
        entityId: id,
        before: {
          clientName: lead.clientName,
          clientEmail: lead.clientEmail,
          clientPhone: lead.clientPhone,
          assignedToUserId: lead.assignedToUserId
        },
        after: {
          clientName: updated.clientName,
          clientEmail: updated.clientEmail,
          clientPhone: updated.clientPhone,
          assignedToUserId: updated.assignedToUserId
        },
        request
      });

      return reply.send({ lead: updated });
    }
  );

  app.post(
    "/api/leads/:id/transition",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const body = transitionBodySchema.parse(request.body);

      const lead = await app.prisma.lead.findUnique({ where: { id } });
      if (!lead) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }
      assertLeadAccess(lead, user);
      const settings = await getPortalSettings(app.prisma);
      assertLeadMutableForOp(lead, settings, "TRANSITION");

      assertManualTransition(settings, lead.status, body.toStatus, user.role);

      const updated = await app.prisma.lead.update({
        where: { id },
        data: { status: body.toStatus }
      });

      await logActivity({
        prisma: app.prisma,
        userId: user.id,
        action: ActivityAction.STATUS_CHANGE,
        entityType: "Lead",
        entityId: id,
        before: { status: lead.status },
        after: { status: updated.status },
        request
      });

      return reply.send({ lead: updated });
    }
  );

  app.post(
    "/api/leads/:id/payments",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const body = markPaymentBodySchema.parse(request.body);

      const lead = await app.prisma.lead.findUnique({ where: { id } });
      if (!lead) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }
      assertLeadAccess(lead, user);
      const settings = await getPortalSettings(app.prisma);
      assertLeadMutableForOp(lead, settings, "MARK_PAYMENT");

      const requiredAdvance = getRequiredLeadStatusForPaymentKind(settings, "ADVANCE");
      const requiredFinal = getRequiredLeadStatusForPaymentKind(settings, "FINAL");

      if (body.kind === PaymentKind.ADVANCE && lead.status !== requiredAdvance) {
        throw new HttpError(
          400,
          "INVALID_STATE",
          `Advance payments can only be marked while the lead is ${requiredAdvance}.`
        );
      }
      if (body.kind === PaymentKind.FINAL && lead.status !== requiredFinal) {
        throw new HttpError(
          400,
          "INVALID_STATE",
          `Final payments can only be marked while the lead is ${requiredFinal}.`
        );
      }

      const pending = await app.prisma.leadPayment.findFirst({
        where: {
          leadId: id,
          kind: body.kind,
          verificationStatus: PaymentVerificationStatus.PENDING
        }
      });
      if (pending) {
        throw new HttpError(409, "PENDING_PAYMENT", "A pending payment of this type already exists.");
      }

      const payment = await app.prisma.leadPayment.create({
        data: {
          leadId: id,
          kind: body.kind,
          amountCents: body.amountCents,
          repNote: body.repNote ?? undefined,
          markedByUserId: user.id
        }
      });

      await logActivity({
        prisma: app.prisma,
        userId: user.id,
        action: ActivityAction.PAYMENT_MARKED,
        entityType: "LeadPayment",
        entityId: payment.id,
        after: { kind: payment.kind, amountCents: payment.amountCents, leadId: id },
        request
      });

      return reply.status(201).send({ payment });
    }
  );
}
