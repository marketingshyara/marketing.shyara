import type { FastifyInstance } from "fastify";
import {
  ActivityAction,
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus,
  Prisma,
  UserRole
} from "@prisma/client";
import type { User } from "@prisma/client";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { splitAgreedTotalCents } from "../lib/money.js";
import { clampPage } from "../lib/pagination.js";
import { getCommissionRepUserId } from "../services/commissionRep.js";
import { assertManualTransition, commissionAmountCents } from "../services/leadFsm.js";
import { assertLeadAccess } from "../services/leadAccess.js";
import { assertLeadMutable } from "../services/leadGuards.js";
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

async function assertWebsiteTemplateExists(
  prisma: Prisma.TransactionClient | FastifyInstance["prisma"],
  websiteTemplateId: string | null | undefined
): Promise<void> {
  if (websiteTemplateId === undefined || websiteTemplateId === null) return;
  const row = await prisma.websiteTemplate.findUnique({ where: { id: websiteTemplateId } });
  if (!row) {
    throw new HttpError(400, "INVALID_TEMPLATE", "Unknown website template.");
  }
}

function hasVerifiedAdvance(lead: {
  payments: { kind: PaymentKind; verificationStatus: PaymentVerificationStatus }[];
}): boolean {
  return lead.payments.some(
    (p) => p.kind === PaymentKind.ADVANCE && p.verificationStatus === PaymentVerificationStatus.VERIFIED
  );
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

      if (query.assignedToUserId && user.role !== UserRole.ADMIN) {
        throw new HttpError(403, "FORBIDDEN", "Only admins can filter leads by assignee.");
      }

      const filters = {
        ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {}),
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
      await assertWebsiteTemplateExists(app.prisma, body.websiteTemplateId);

      const portalSettings = await getPortalSettings(app.prisma);

      let advanceAmountCents = body.advanceAmountCents ?? undefined;
      let finalQuoteCents = body.finalQuoteCents ?? undefined;
      let agreedTotalCents: number | undefined = body.agreedTotalCents ?? undefined;
      if (body.agreedTotalCents != null) {
        const split = splitAgreedTotalCents(
          body.agreedTotalCents,
          portalSettings.advancePaymentShareBps
        );
        advanceAmountCents = split.advanceAmountCents;
        finalQuoteCents = split.finalQuoteCents;
        agreedTotalCents = body.agreedTotalCents;
      }

      const lead = await app.prisma.lead.create({
        data: {
          createdByUserId: user.id,
          assignedToUserId,
          clientName: body.clientName,
          clientEmail: body.clientEmail ?? undefined,
          clientPhone: body.clientPhone ?? undefined,
          notes: body.notes ?? undefined,
          advanceAmountCents,
          finalQuoteCents,
          agreedTotalCents,
          websiteTemplateId: body.websiteTemplateId ?? undefined,
          status: LeadStatus.NEW
        },
        include: { websiteTemplate: true }
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
      // Scope the lookup itself so non-members get a uniform 404 instead of a 403/404 enumeration signal.
      const lead =
        user.role === UserRole.ADMIN
          ? await app.prisma.lead.findUnique({
              where: { id },
              include: {
                payments: { orderBy: { markedAt: "desc" } },
                commission: true,
                project: true,
                websiteTemplate: true
              }
            })
          : await app.prisma.lead.findFirst({
              where: { id, ...repLeadScope(user.id) },
              include: {
                payments: { orderBy: { markedAt: "desc" } },
                commission: true,
                project: true,
                websiteTemplate: true
              }
            });
      if (!lead) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }
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

      const result = await app.prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({
          where: { id },
          include: { payments: true }
        });
        if (!lead) {
          throw new HttpError(404, "NOT_FOUND", "Lead not found.");
        }
        assertLeadAccess(lead, user);
        const settings = await getPortalSettings(tx);
        assertLeadMutable(lead, settings);
        const commission = await tx.commission.findUnique({ where: { leadId: id } });

        await assertWebsiteTemplateExists(tx, body.websiteTemplateId);

        let assignedToUserId: string | null | undefined = undefined;
        if (body.assignedToUserId !== undefined) {
          if (user.role !== UserRole.ADMIN) {
            throw new HttpError(403, "FORBIDDEN", "Only admins can change lead assignment.");
          }
          if (body.assignedToUserId === null) {
            if (commission && !commission.isPaid) {
              throw new HttpError(
                400,
                "ASSIGNEE_REQUIRED_FOR_COMMISSION",
                "Lead assignment cannot be cleared while commission is unpaid."
              );
            }
            assignedToUserId = null;
          } else {
            const assignee = await tx.user.findUnique({ where: { id: body.assignedToUserId } });
            if (!assignee?.isActive || assignee.role !== UserRole.SALES_REP) {
              throw new HttpError(400, "INVALID_ASSIGNEE", "Assignee must be an active sales rep.");
            }
            assignedToUserId = assignee.id;
          }
        }

        if (body.markContentReceived === false && user.role !== UserRole.ADMIN) {
          throw new HttpError(403, "FORBIDDEN", "Only an admin can clear content received.");
        }
        if (body.markContentReceived === true) {
          if (!hasVerifiedAdvance(lead)) {
            throw new HttpError(
              400,
              "INVALID_STATE",
              "Advance payment must be verified before marking content received."
            );
          }
          const templateId = body.websiteTemplateId ?? lead.websiteTemplateId;
          if (!templateId) {
            throw new HttpError(
              400,
              "TEMPLATE_REQUIRED",
              "Select a website template before marking content received."
            );
          }
        }

        let agreedPatch: {
          agreedTotalCents?: number | null;
          advanceAmountCents?: number | null;
          finalQuoteCents?: number | null;
        } = {};
        if (body.agreedTotalCents !== undefined) {
          if (body.agreedTotalCents === null) {
            agreedPatch = { agreedTotalCents: null };
          } else {
            const split = splitAgreedTotalCents(
              body.agreedTotalCents,
              settings.advancePaymentShareBps
            );
            agreedPatch = {
              agreedTotalCents: body.agreedTotalCents,
              advanceAmountCents: split.advanceAmountCents,
              finalQuoteCents: split.finalQuoteCents
            };
          }
        }

        const data: Prisma.LeadUncheckedUpdateManyInput = {
          ...(body.clientName !== undefined ? { clientName: body.clientName } : {}),
          ...(body.clientEmail !== undefined ? { clientEmail: body.clientEmail } : {}),
          ...(body.clientPhone !== undefined ? { clientPhone: body.clientPhone } : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
          ...agreedPatch,
          ...(body.agreedTotalCents === undefined && body.advanceAmountCents !== undefined
            ? { advanceAmountCents: body.advanceAmountCents }
            : {}),
          ...(body.agreedTotalCents === undefined && body.finalQuoteCents !== undefined
            ? { finalQuoteCents: body.finalQuoteCents }
            : {}),
          ...(body.websiteTemplateId !== undefined ? { websiteTemplateId: body.websiteTemplateId } : {}),
          ...(body.markContentReceived === true ? { contentReceivedAt: new Date() } : {}),
          ...(body.markContentReceived === false ? { contentReceivedAt: null } : {}),
          ...(assignedToUserId !== undefined ? { assignedToUserId } : {})
        };

        const hasLeadFieldUpdates = Object.keys(data).length > 0;
        let updated = lead;
        if (hasLeadFieldUpdates) {
          const claim = await tx.lead.updateMany({
            where: { id, updatedAt: lead.updatedAt },
            data
          });
          if (claim.count === 0) {
            throw new HttpError(
              409,
              "CONCURRENT_MODIFICATION",
              "Lead was modified concurrently; refresh and retry."
            );
          }
          updated = await tx.lead.findUniqueOrThrow({
            where: { id },
            include: { payments: true }
          });
        }

        if (commission && !commission.isPaid) {
          const commissionUpdate: { repUserId?: string; amountCents?: number } = {};
          if (assignedToUserId !== undefined) {
            const nextRepUserId = getCommissionRepUserId(updated);
            if (commission.repUserId !== nextRepUserId) {
              commissionUpdate.repUserId = nextRepUserId;
            }
          }
          if (
            (settings.commissionBasis === "FINAL_QUOTE" && body.finalQuoteCents !== undefined) ||
            (settings.commissionBasis === "AGREED_TOTAL" && body.agreedTotalCents !== undefined)
          ) {
            const amountCents = commissionAmountCents(updated, 0, settings);
            if (amountCents !== commission.amountCents) {
              commissionUpdate.amountCents = amountCents;
            }
          }
          if (Object.keys(commissionUpdate).length > 0) {
            await tx.commission.update({
              where: { leadId: id },
              data: commissionUpdate
            });
          }
        }

        await logActivity({
          prisma: app.prisma,
          tx,
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

        return updated;
      });

      const detailInclude = {
        payments: { orderBy: { markedAt: "desc" as const } },
        commission: true,
        project: true,
        websiteTemplate: true
      } satisfies Prisma.LeadInclude;
      const leadOut =
        user.role === UserRole.ADMIN
          ? await app.prisma.lead.findUnique({ where: { id }, include: detailInclude })
          : await app.prisma.lead.findFirst({
              where: { id, ...repLeadScope(user.id) },
              include: detailInclude
            });
      if (!leadOut) {
        throw new HttpError(404, "NOT_FOUND", "Lead not found.");
      }
      return reply.send({ lead: leadOut });
    }
  );

  app.post(
    "/api/leads/:id/transition",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const body = transitionBodySchema.parse(request.body);

      const result = await app.prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({ where: { id } });
        if (!lead) {
          throw new HttpError(404, "NOT_FOUND", "Lead not found.");
        }
        assertLeadAccess(lead, user);
        const settings = await getPortalSettings(tx);
        assertLeadMutable(lead, settings);

        assertManualTransition(settings, lead.status, body.toStatus, user.role);

        // Atomic CAS: if a concurrent transition flipped the status, count is 0 and we surface a 409.
        const claim = await tx.lead.updateMany({
          where: { id, status: lead.status },
          data: { status: body.toStatus }
        });
        if (claim.count === 0) {
          throw new HttpError(
            409,
            "CONCURRENT_MODIFICATION",
            "Lead state changed concurrently; refresh and retry."
          );
        }
        const updated = await tx.lead.findUniqueOrThrow({ where: { id } });

        await logActivity({
          prisma: app.prisma,
          tx,
          userId: user.id,
          action: ActivityAction.STATUS_CHANGE,
          entityType: "Lead",
          entityId: id,
          before: { status: lead.status },
          after: { status: updated.status },
          request
        });

        return updated;
      });

      return reply.send({ lead: result });
    }
  );

  app.post(
    "/api/leads/:id/payments",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const body = markPaymentBodySchema.parse(request.body);

      try {
        const payment = await app.prisma.$transaction(
          async (tx) => {
            const lead = await tx.lead.findUnique({ where: { id } });
            if (!lead) {
              throw new HttpError(404, "NOT_FOUND", "Lead not found.");
            }
            assertLeadAccess(lead, user);
            const settings = await getPortalSettings(tx);
            assertLeadMutable(lead, settings);

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

            let created;
            try {
              created = await tx.leadPayment.create({
                data: {
                  leadId: id,
                  kind: body.kind,
                  amountCents: body.amountCents,
                  repNote: body.repNote ?? undefined,
                  markedByUserId: user.id
                }
              });
            } catch (error) {
              if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new HttpError(409, "PENDING_PAYMENT", "A pending payment of this type already exists.");
              }
              throw error;
            }

            await logActivity({
              prisma: app.prisma,
              tx,
              userId: user.id,
              action: ActivityAction.PAYMENT_MARKED,
              entityType: "LeadPayment",
              entityId: created.id,
              after: { kind: created.kind, amountCents: created.amountCents, leadId: id },
              request
            });

            return created;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );

        return reply.status(201).send({ payment });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
          throw new HttpError(
            409,
            "CONCURRENT_MODIFICATION",
            "Lead or payment state changed concurrently; refresh and retry."
          );
        }
        throw error;
      }
    }
  );
}
