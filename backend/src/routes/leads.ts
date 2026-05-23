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
import {
  assertAdminLeadPatchBody,
  assertSalesRepActor,
  wasPatchFieldSent
} from "../services/leadMutations.js";
import {
  assertLeadMutable,
  assertMarkedPaymentAmountMatchesLead
} from "../services/leadGuards.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings, getRequiredLeadStatusForPaymentKind } from "../services/settings.js";
import { getPipelineStages, summarizePipelineStages } from "../services/pipeline.js";
import { notifyActiveAdmins } from "../services/notifications.js";
import { stageDeclineNotesAfterClear } from "../services/stageDeclineNotes.js";
import type { StageDeclineNoteKey } from "../services/stageDeclineNotes.js";
import { PortalNotificationKind } from "@prisma/client";
import {
  convertLeadBodySchema,
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
  user: User,
  body: { assignedToUserId?: string | null }
): Promise<string> {
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

      const viewStatusFilter =
        query.view === "clients"
          ? { status: { not: LeadStatus.COMMISSION_PAID } }
          : query.view === "completed"
            ? { status: LeadStatus.COMMISSION_PAID }
            : query.status
              ? { status: query.status }
              : {};

      const filters = {
        ...(query.view === "leads" ? { convertedAt: null } : {}),
        ...(query.view === "clients" || query.view === "completed"
          ? { convertedAt: { not: null } }
          : {}),
        ...viewStatusFilter,
        ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {}),
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

      await app.prisma.lead.updateMany({
        where: {
          ...where,
          status: { not: LeadStatus.COMMISSION_PAID },
          commission: { is: { isPaid: true } }
        },
        data: { status: LeadStatus.COMMISSION_PAID }
      });

      const total = await app.prisma.lead.count({ where });
      const page = clampPage(query.page, query.pageSize, total);
      const skip = (page - 1) * query.pageSize;
      const items = await app.prisma.lead.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          payments: { orderBy: { markedAt: "desc" } },
          project: true
        }
      });

      const settings = await getPortalSettings(app.prisma);
      const itemsWithSummary = items.map((lead) => {
        const pipelineStages = getPipelineStages(lead, settings, user.role);
        const pipelineSummary = summarizePipelineStages(pipelineStages);
        return { ...lead, pipelineSummary };
      });

      return reply.send({
        items: itemsWithSummary,
        total,
        page,
        pageSize: query.pageSize
      });
    }
  );

  app.post(
    "/api/leads",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const body = createLeadBodySchema.parse(request.body);

      const assignedToUserId = await resolveAssignedRepForCreate(user, body);
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
      const settings = await getPortalSettings(app.prisma);
      const pipelineStages = getPipelineStages(lead, settings, user.role);
      return reply.send({ lead, pipelineStages });
    }
  );

  app.post(
    "/api/leads/:id/convert",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      assertSalesRepActor(user);
      const { id } = request.params as { id: string };
      const body = convertLeadBodySchema.parse(request.body);

      try {
        const leadOut = await app.prisma.$transaction(
          async (tx) => {
            const lead = await tx.lead.findUnique({ where: { id }, include: { payments: true } });
            if (!lead) {
              throw new HttpError(404, "NOT_FOUND", "Lead not found.");
            }
            assertLeadAccess(lead, user);
            const settings = await getPortalSettings(tx);
            assertLeadMutable(lead, settings);

            if (lead.convertedAt) {
              throw new HttpError(400, "ALREADY_CONVERTED", "This lead is already a client.");
            }

            if (body.agreedTotalCents < settings.minAgreedTotalCents) {
              throw new HttpError(
                400,
                "MIN_PRICE",
                `Agreed total must be at least ₹${Math.round(settings.minAgreedTotalCents / 100)}.`
              );
            }

            await assertWebsiteTemplateExists(tx, body.websiteTemplateId);

            const split = splitAgreedTotalCents(body.agreedTotalCents, settings.advancePaymentShareBps);
            const advanceAmountCents = split.advanceAmountCents;

            const requiredStatus = getRequiredLeadStatusForPaymentKind(settings, "ADVANCE");
            if (lead.status !== requiredStatus) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                `Advance can only be recorded while lead is ${requiredStatus}.`
              );
            }

            const claim = await tx.lead.updateMany({
              where: {
                id,
                convertedAt: null,
                updatedAt: lead.updatedAt,
                status: requiredStatus
              },
              data: {
                convertedAt: new Date(),
                websiteTemplateId: body.websiteTemplateId,
                agreedTotalCents: body.agreedTotalCents,
                advanceAmountCents,
                finalQuoteCents: split.finalQuoteCents
              }
            });
            if (claim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
            }

            try {
              await tx.leadPayment.create({
                data: {
                  leadId: id,
                  kind: PaymentKind.ADVANCE,
                  amountCents: advanceAmountCents,
                  repNote: body.repNote ?? undefined,
                  markedByUserId: user.id
                }
              });
            } catch (error) {
              if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new HttpError(409, "PENDING_PAYMENT", "A pending advance payment already exists.");
              }
              throw error;
            }

            const out = await tx.lead.findUniqueOrThrow({
              where: { id },
              include: {
                payments: { orderBy: { markedAt: "desc" } },
                commission: true,
                project: true,
                websiteTemplate: true
              }
            });
            await notifyActiveAdmins(tx, {
              leadId: id,
              kind: PortalNotificationKind.REP_SUBMITTED,
              stageKey: "convert_deal",
              message: `${out.clientName}: deal submitted for admin approval.`,
              excludeUserId: user.id
            });
            return out;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );

        const settings = await getPortalSettings(app.prisma);
        const pipelineStages = getPipelineStages(leadOut, settings, user.role);
        return reply.status(201).send({ lead: leadOut, pipelineStages });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
          throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead state changed concurrently.");
        }
        throw error;
      }
    }
  );

  app.patch(
    "/api/leads/:id",
    { preHandler: [requireUser] },
    async (request, reply) => {
      const user = request.currentUser!;
      const { id } = request.params as { id: string };
      const rawBody = (request.body ?? {}) as Record<string, unknown>;
      const body = patchLeadBodySchema.parse(rawBody);
      if (user.role === UserRole.ADMIN) {
        assertAdminLeadPatchBody(rawBody);
      }

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

        if (wasPatchFieldSent(rawBody, "websiteTemplateId")) {
          await assertWebsiteTemplateExists(tx, body.websiteTemplateId);
        }

        let assignedToUserId: string | null | undefined = undefined;
        if (wasPatchFieldSent(rawBody, "assignedToUserId") && body.assignedToUserId !== undefined) {
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

        if (
          wasPatchFieldSent(rawBody, "agreedTotalCents") &&
          body.agreedTotalCents != null &&
          body.agreedTotalCents < settings.minAgreedTotalCents
        ) {
          throw new HttpError(
            400,
            "MIN_PRICE",
            `Agreed total must be at least ₹${Math.round(settings.minAgreedTotalCents / 100)}.`
          );
        }

        if (wasPatchFieldSent(rawBody, "whatsappGroupLink") && body.whatsappGroupLink !== undefined) {
          if (!hasVerifiedAdvance(lead)) {
            throw new HttpError(400, "INVALID_STATE", "Advance must be verified before WhatsApp link.");
          }
        }

        if (wasPatchFieldSent(rawBody, "markDemoFinalized") && body.markDemoFinalized === true) {
          const project = await tx.project.findUnique({ where: { leadId: id } });
          if (!project?.previewUrl) {
            throw new HttpError(400, "INVALID_STATE", "Demo link must be ready before finalizing.");
          }
        }

        if (
          wasPatchFieldSent(rawBody, "markAccountsReady") &&
          body.markAccountsReady === true &&
          !lead.demoFinalizedVerifiedAt &&
          !(wasPatchFieldSent(rawBody, "markDemoFinalized") && body.markDemoFinalized === true)
        ) {
          throw new HttpError(400, "INVALID_STATE", "Admin must verify demo approval before accounts ready.");
        }

        if (wasPatchFieldSent(rawBody, "markAccountsReady") && body.markAccountsReady === true) {
          const githubId = wasPatchFieldSent(rawBody, "clientGithubId")
            ? body.clientGithubId?.trim()
            : lead.clientGithubId?.trim();
          const githubEmail = wasPatchFieldSent(rawBody, "clientGithubEmail")
            ? body.clientGithubEmail?.trim()
            : lead.clientGithubEmail?.trim();
          if (!githubId || !githubEmail) {
            throw new HttpError(
              400,
              "VALIDATION_ERROR",
              "GitHub username and email are required before marking accounts ready."
            );
          }
        }

        let agreedPatch: {
          agreedTotalCents?: number | null;
          advanceAmountCents?: number | null;
          finalQuoteCents?: number | null;
        } = {};
        if (wasPatchFieldSent(rawBody, "agreedTotalCents") && body.agreedTotalCents !== undefined) {
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
          ...(wasPatchFieldSent(rawBody, "clientName") && body.clientName !== undefined
            ? { clientName: body.clientName }
            : {}),
          ...(wasPatchFieldSent(rawBody, "clientEmail") && body.clientEmail !== undefined
            ? { clientEmail: body.clientEmail }
            : {}),
          ...(wasPatchFieldSent(rawBody, "clientPhone") && body.clientPhone !== undefined
            ? { clientPhone: body.clientPhone }
            : {}),
          ...(wasPatchFieldSent(rawBody, "notes") && body.notes !== undefined ? { notes: body.notes } : {}),
          ...(wasPatchFieldSent(rawBody, "agreedTotalCents") ? agreedPatch : {}),
          ...(wasPatchFieldSent(rawBody, "advanceAmountCents") &&
          !wasPatchFieldSent(rawBody, "agreedTotalCents") &&
          body.advanceAmountCents !== undefined
            ? { advanceAmountCents: body.advanceAmountCents }
            : {}),
          ...(wasPatchFieldSent(rawBody, "finalQuoteCents") &&
          !wasPatchFieldSent(rawBody, "agreedTotalCents") &&
          body.finalQuoteCents !== undefined
            ? { finalQuoteCents: body.finalQuoteCents }
            : {}),
          ...(wasPatchFieldSent(rawBody, "websiteTemplateId") && body.websiteTemplateId !== undefined
            ? { websiteTemplateId: body.websiteTemplateId }
            : {}),
          ...(wasPatchFieldSent(rawBody, "whatsappGroupLink") && body.whatsappGroupLink !== undefined
            ? { whatsappGroupLink: body.whatsappGroupLink }
            : {}),
          ...(wasPatchFieldSent(rawBody, "markDemoFinalized") && body.markDemoFinalized === true
            ? { demoFinalizedAt: new Date() }
            : {}),
          ...(wasPatchFieldSent(rawBody, "markAccountsReady") && body.markAccountsReady === true
            ? { accountsReadyAt: new Date() }
            : {}),
          ...(wasPatchFieldSent(rawBody, "clientGithubId") && body.clientGithubId !== undefined
            ? { clientGithubId: body.clientGithubId }
            : {}),
          ...(wasPatchFieldSent(rawBody, "clientGithubEmail") && body.clientGithubEmail !== undefined
            ? { clientGithubEmail: body.clientGithubEmail }
            : {}),
          ...(assignedToUserId !== undefined ? { assignedToUserId } : {})
        };

        const declineClearKeys: StageDeclineNoteKey[] = [];
        if (wasPatchFieldSent(rawBody, "whatsappGroupLink") && body.whatsappGroupLink) {
          declineClearKeys.push("whatsapp_group");
        }
        if (wasPatchFieldSent(rawBody, "markDemoFinalized") && body.markDemoFinalized === true) {
          declineClearKeys.push("demo_finalized");
        }
        if (wasPatchFieldSent(rawBody, "markAccountsReady") && body.markAccountsReady === true) {
          declineClearKeys.push("accounts_ready");
        }
        if (declineClearKeys.length > 0) {
          data.stageDeclineNotes = stageDeclineNotesAfterClear(lead, ...declineClearKeys);
        }

        if (
          wasPatchFieldSent(rawBody, "previewUrl") &&
          body.previewUrl !== undefined &&
          user.role === UserRole.ADMIN
        ) {
          let project = await tx.project.findUnique({ where: { leadId: id } });
          if (!project) {
            if (!hasVerifiedAdvance(lead)) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                "Verify advance payment before adding a preview URL."
              );
            }
            if (!lead.convertedAt) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                "Lead must be converted before adding a preview URL."
              );
            }
            project = await tx.project.create({
              data: {
                leadId: id,
                title: `${lead.clientName} website`
              }
            });
          }
          await tx.project.updateMany({
            where: { id: project.id },
            data: { previewUrl: body.previewUrl ?? null }
          });
        }

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
            wasPatchFieldSent(rawBody, "agreedTotalCents") &&
            body.agreedTotalCents !== undefined
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

        if (user.role === UserRole.SALES_REP) {
          if (
            wasPatchFieldSent(rawBody, "whatsappGroupLink") &&
            body.whatsappGroupLink !== undefined &&
            body.whatsappGroupLink
          ) {
            await notifyActiveAdmins(tx, {
              leadId: id,
              kind: PortalNotificationKind.REP_SUBMITTED,
              stageKey: "whatsapp_group",
              message: `${updated.clientName}: WhatsApp group link submitted.`,
              excludeUserId: user.id
            });
          }
          if (wasPatchFieldSent(rawBody, "markDemoFinalized") && body.markDemoFinalized === true) {
            await notifyActiveAdmins(tx, {
              leadId: id,
              kind: PortalNotificationKind.REP_SUBMITTED,
              stageKey: "demo_finalized",
              message: `${updated.clientName}: client demo approval submitted.`,
              excludeUserId: user.id
            });
          }
          if (wasPatchFieldSent(rawBody, "markAccountsReady") && body.markAccountsReady === true) {
            await notifyActiveAdmins(tx, {
              leadId: id,
              kind: PortalNotificationKind.REP_SUBMITTED,
              stageKey: "accounts_ready",
              message: `${updated.clientName}: accounts ready submitted.`,
              excludeUserId: user.id
            });
          }
        }

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
      const settings = await getPortalSettings(app.prisma);
      const pipelineStages = getPipelineStages(leadOut, settings, user.role);
      return reply.send({ lead: leadOut, pipelineStages });
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
      assertSalesRepActor(user);
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
            if (body.kind === PaymentKind.FINAL && !lead.accountsReadyVerifiedAt) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                "Accounts must be verified before recording due payment."
              );
            }

            assertMarkedPaymentAmountMatchesLead(body.kind, body.amountCents, lead);

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

            const leadRow = await tx.lead.findUniqueOrThrow({ where: { id } });
            await notifyActiveAdmins(tx, {
              leadId: id,
              kind: PortalNotificationKind.REP_SUBMITTED,
              stageKey: created.kind === PaymentKind.ADVANCE ? "advance_verify" : "final_verify",
              message: `${leadRow.clientName}: ${created.kind} payment submitted for verification.`,
              excludeUserId: user.id
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
