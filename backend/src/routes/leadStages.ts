import type { FastifyInstance } from "fastify";
import {
  ActivityAction,
  LeadStatus,
  PaymentKind,
  PaymentVerificationStatus
} from "@prisma/client";
import { requireAdmin } from "../auth/requireRole.js";
import { requireUser } from "../auth/requireUser.js";
import { HttpError } from "../errors/httpError.js";
import { commissionAmountCents } from "../services/leadFsm.js";
import { assertLeadMutable } from "../services/leadGuards.js";
import { getCommissionRepUserId } from "../services/commissionRep.js";
import { logActivity } from "../services/activityLog.js";
import { getPortalSettings } from "../services/settings.js";
import { pipelineStageKeySchema, rejectStageBodySchema, verifyRepoTransferBodySchema } from "../validators/schemas.js";
import {
  notifyActiveAdmins,
  notifyRepOfAdminDecision
} from "../services/notifications.js";
import {
  clearStageDeclineNotesForVerify,
  persistStageDeclineNote
} from "../services/stageDeclineNotes.js";
import { PortalNotificationKind, UserRole } from "@prisma/client";
import { promoteLeadToDeployedIfEligible } from "../services/commissionPayout.js";
import { getPipelineStages } from "../services/pipeline.js";

function hasVerifiedPayment(
  lead: { payments: { kind: PaymentKind; verificationStatus: PaymentVerificationStatus }[] },
  kind: PaymentKind
): boolean {
  return lead.payments.some(
    (p) => p.kind === kind && p.verificationStatus === PaymentVerificationStatus.VERIFIED
  );
}

export async function registerLeadStageRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/leads/:id/stages/:stageKey/verify",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { id, stageKey } = request.params as { id: string; stageKey: string };
      const key = pipelineStageKeySchema.parse(stageKey);
      const repoTransferBody =
        key === "repo_transfer"
          ? verifyRepoTransferBodySchema.parse(request.body ?? {})
          : null;

      const result = await app.prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({
          where: { id },
          include: { payments: true, project: true, commission: true }
        });
        if (!lead) {
          throw new HttpError(404, "NOT_FOUND", "Lead not found.");
        }
        const settings = await getPortalSettings(tx);
        assertLeadMutable(lead, settings);

        const now = new Date();
        let project = lead.project;

        switch (key) {
          case "whatsapp": {
            if (!lead.convertedAt) {
              throw new HttpError(400, "INVALID_STATE", "Client must be converted before WhatsApp verification.");
            }
            if (!hasVerifiedPayment(lead, PaymentKind.ADVANCE)) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                "Advance payment must be verified before WhatsApp verification."
              );
            }
            if (!lead.whatsappGroupLink) {
              throw new HttpError(400, "INVALID_STATE", "WhatsApp group link is not set.");
            }
            if (lead.whatsappVerifiedAt) {
              throw new HttpError(400, "ALREADY_PROCESSED", "WhatsApp stage already verified.");
            }
            const claim = await tx.lead.updateMany({
              where: { id, whatsappVerifiedAt: null },
              data: {
                whatsappVerifiedAt: now,
                status:
                  lead.status === LeadStatus.ADVANCE_PAID ? LeadStatus.BUILDING : lead.status
              }
            });
            if (claim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
            }
            break;
          }
          case "preview_ready": {
            project = lead.project;
            if (!project?.previewUrl) {
              throw new HttpError(400, "INVALID_STATE", "Set a preview URL before verifying demo ready.");
            }
            if (lead.status !== LeadStatus.BUILDING && lead.status !== LeadStatus.ADVANCE_PAID) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                "Lead must be BUILDING or ADVANCE_PAID before demo can be marked ready."
              );
            }
            const leadClaim = await tx.lead.updateMany({
              where: {
                id,
                status: { in: [LeadStatus.BUILDING, LeadStatus.ADVANCE_PAID] }
              },
              data: { status: LeadStatus.PREVIEW_SENT }
            });
            if (leadClaim.count === 0) {
              throw new HttpError(
                409,
                "CONCURRENT_MODIFICATION",
                "Lead state changed concurrently; refresh and retry."
              );
            }
            break;
          }
          case "demo_finalized": {
            if (!lead.demoFinalizedAt) {
              throw new HttpError(400, "INVALID_STATE", "Rep has not marked demo as client-approved.");
            }
            if (lead.demoFinalizedVerifiedAt) {
              throw new HttpError(400, "ALREADY_PROCESSED", "Demo approval already verified.");
            }
            const claim = await tx.lead.updateMany({
              where: { id, demoFinalizedVerifiedAt: null },
              data: { demoFinalizedVerifiedAt: now }
            });
            if (claim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
            }
            break;
          }
          case "accounts_ready": {
            if (!lead.accountsReadyAt) {
              throw new HttpError(400, "INVALID_STATE", "Rep has not marked accounts ready.");
            }
            if (lead.accountsReadyVerifiedAt) {
              throw new HttpError(400, "ALREADY_PROCESSED", "Accounts stage already verified.");
            }
            const claim = await tx.lead.updateMany({
              where: { id, accountsReadyVerifiedAt: null },
              data: { accountsReadyVerifiedAt: now }
            });
            if (claim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
            }
            break;
          }
          case "repo_transfer": {
            if (!hasVerifiedPayment(lead, PaymentKind.ADVANCE)) {
              throw new HttpError(400, "INVALID_STATE", "Advance must be verified first.");
            }
            const hasFinal = hasVerifiedPayment(lead, PaymentKind.FINAL);
            if (!hasFinal) {
              throw new HttpError(400, "INVALID_STATE", "Final payment must be verified first.");
            }
            if (lead.repoTransferVerifiedAt) {
              throw new HttpError(400, "ALREADY_PROCESSED", "Repo transfer already verified.");
            }
            const claim = await tx.lead.updateMany({
              where: { id, repoTransferVerifiedAt: null },
              data: {
                repoTransferVerifiedAt: now,
                transferredGithubRepoUrl: repoTransferBody!.transferredGithubRepoUrl
              }
            });
            if (claim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
            }
            break;
          }
          case "client_details": {
            if (!lead.convertedAt) {
              throw new HttpError(
                400,
                "INVALID_STATE",
                "Client details review is only for converted clients."
              );
            }
            if (!lead.clientDetailsSubmittedAt) {
              throw new HttpError(400, "INVALID_STATE", "Rep has not submitted updated client details.");
            }
            if (lead.clientDetailsVerifiedAt) {
              throw new HttpError(400, "ALREADY_PROCESSED", "Client details already verified.");
            }
            const claim = await tx.lead.updateMany({
              where: { id, clientDetailsVerifiedAt: null },
              data: { clientDetailsVerifiedAt: now }
            });
            if (claim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
            }
            break;
          }
          case "deployment": {
            project = lead.project;
            if (!project?.deploymentSubmittedAt) {
              throw new HttpError(400, "INVALID_STATE", "Deployment has not been submitted.");
            }
            if (project.deploymentVerifiedAt) {
              throw new HttpError(400, "ALREADY_PROCESSED", "Deployment already verified.");
            }
            const projClaim = await tx.project.updateMany({
              where: { id: project.id, deploymentVerifiedAt: null },
              data: { deploymentVerifiedAt: now }
            });
            if (projClaim.count === 0) {
              throw new HttpError(409, "CONCURRENT_MODIFICATION", "Project was modified concurrently.");
            }
            const freshLead = await tx.lead.findUniqueOrThrow({
              where: { id },
              include: { payments: true }
            });
            if (freshLead.agreedTotalCents == null || freshLead.agreedTotalCents <= 0) {
              throw new HttpError(
                400,
                "AGREED_TOTAL_REQUIRED",
                "Set the agreed project total on the lead before verifying deployment."
              );
            }
            const verifiedFinal = freshLead.payments.find(
              (p) =>
                p.kind === "FINAL" &&
                p.verificationStatus === PaymentVerificationStatus.VERIFIED
            );
            const amountCents = commissionAmountCents(
              freshLead,
              verifiedFinal?.amountCents ?? 0,
              settings
            );
            const repId = getCommissionRepUserId(freshLead);
            await tx.commission.upsert({
              where: { leadId: id },
              create: { leadId: id, repUserId: repId, amountCents, bonusCents: 0 },
              update: { repUserId: repId, amountCents }
            });
            await promoteLeadToDeployedIfEligible(tx, id, {
              deploymentVerifiedAt: now
            });
            break;
          }
          default:
            throw new HttpError(400, "INVALID_STAGE", "Unknown stage.");
        }

        await clearStageDeclineNotesForVerify(tx, id, lead, key);

        const updated = await tx.lead.findUniqueOrThrow({
          where: { id },
          include: {
            payments: { orderBy: { markedAt: "desc" } },
            commission: true,
            project: true,
            websiteTemplate: true
          }
        });

        await logActivity({
          prisma: app.prisma,
          tx,
          userId: admin.id,
          action: ActivityAction.UPDATE,
          entityType: "Lead",
          entityId: id,
          after: { stageVerified: key },
          request
        });

        const repId = updated.assignedToUserId ?? updated.createdByUserId;
        await notifyRepOfAdminDecision(tx, {
          leadId: id,
          repUserId: repId,
          kind: PortalNotificationKind.ADMIN_VERIFIED,
          stageKey: key,
          message: `${updated.clientName}: ${key} verified by admin.`
        });

        const pipelineStages = getPipelineStages(updated, settings, UserRole.ADMIN);
        return { lead: updated, pipelineStages };
      });

      return reply.send(result);
    }
  );

  app.post(
    "/api/leads/:id/stages/:stageKey/reject",
    { preHandler: [requireUser] },
    async (request, reply) => {
      requireAdmin(request);
      const admin = request.currentUser!;
      const { id, stageKey } = request.params as { id: string; stageKey: string };
      const key = pipelineStageKeySchema.parse(stageKey);
      const body = rejectStageBodySchema.parse(request.body ?? {});

      const result = await app.prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({
          where: { id },
          include: { payments: true, project: true, commission: true }
        });
        if (!lead) {
          throw new HttpError(404, "NOT_FOUND", "Lead not found.");
        }
        const settings = await getPortalSettings(tx);
        assertLeadMutable(lead, settings);

        switch (key) {
          case "whatsapp": {
            if (!lead.whatsappGroupLink && !lead.whatsappVerifiedAt) {
              throw new HttpError(400, "INVALID_STATE", "Nothing to decline on WhatsApp stage.");
            }
            await tx.lead.updateMany({
              where: { id },
              data: { whatsappGroupLink: null, whatsappVerifiedAt: null }
            });
            break;
          }
          case "demo_finalized": {
            await tx.lead.updateMany({
              where: { id },
              data: { demoFinalizedAt: null, demoFinalizedVerifiedAt: null }
            });
            break;
          }
          case "accounts_ready": {
            await tx.lead.updateMany({
              where: { id },
              data: { accountsReadyAt: null, accountsReadyVerifiedAt: null }
            });
            break;
          }
          case "deployment": {
            const project = lead.project;
            if (!project) {
              throw new HttpError(400, "INVALID_STATE", "No project for deployment decline.");
            }
            await tx.project.updateMany({
              where: { id: project.id },
              data: {
                deployedUrl: null,
                deploymentSubmittedAt: null,
                deploymentVerifiedAt: null
              }
            });
            break;
          }
          case "client_details": {
            if (!lead.convertedAt) {
              throw new HttpError(400, "INVALID_STATE", "Client details review is only for converted clients.");
            }
            if (!lead.clientDetailsSubmittedAt && !lead.clientDetailsVerifiedAt) {
              throw new HttpError(400, "INVALID_STATE", "Nothing to decline on client details.");
            }
            await tx.lead.updateMany({
              where: { id },
              data: {
                clientDetailsSubmittedAt: null,
                clientDetailsVerifiedAt: null
              }
            });
            break;
          }
          case "preview_ready":
          case "repo_transfer":
            throw new HttpError(
              400,
              "INVALID_STAGE",
              "This stage cannot be declined; update or verify instead."
            );
          default:
            throw new HttpError(400, "INVALID_STAGE", "Unknown stage.");
        }

        await persistStageDeclineNote(tx, id, lead, key, body.adminNote ?? null);

        const updated = await tx.lead.findUniqueOrThrow({
          where: { id },
          include: {
            payments: { orderBy: { markedAt: "desc" } },
            commission: true,
            project: true,
            websiteTemplate: true
          }
        });

        await logActivity({
          prisma: app.prisma,
          tx,
          userId: admin.id,
          action: ActivityAction.UPDATE,
          entityType: "Lead",
          entityId: id,
          after: { stageRejected: key, adminNote: body.adminNote ?? null },
          request
        });

        const repId = updated.assignedToUserId ?? updated.createdByUserId;
        const note = body.adminNote?.trim() ? ` Note: ${body.adminNote.trim()}` : "";
        const declineMessage = `${updated.clientName}: ${key} declined by admin.${note}`;
        await notifyRepOfAdminDecision(tx, {
          leadId: id,
          repUserId: repId,
          kind: PortalNotificationKind.ADMIN_DECLINED,
          stageKey: key,
          message: declineMessage
        });
        await notifyActiveAdmins(tx, {
          leadId: id,
          kind: PortalNotificationKind.ADMIN_DECLINED,
          stageKey: key,
          message: declineMessage,
          excludeUserId: admin.id
        });

        const pipelineStages = getPipelineStages(updated, settings, UserRole.ADMIN);
        return { lead: updated, pipelineStages };
      });

      return reply.send(result);
    }
  );
}
