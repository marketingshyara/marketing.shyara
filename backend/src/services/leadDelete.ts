import { ActivityAction, type PrismaClient, type User, UserRole } from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { HttpError } from "../errors/httpError.js";
import { assertLeadAccess } from "./leadAccess.js";
import { assertLeadDeletable } from "./leadGuards.js";
import { logActivity } from "./activityLog.js";

function repLeadScope(userId: string) {
  return {
    OR: [{ createdByUserId: userId }, { assignedToUserId: userId }]
  };
}

export type DeleteLeadResult =
  | { ok: true; id: string }
  | { ok: false; id: string; code: string; message: string };

type LeadForDelete = Awaited<ReturnType<typeof loadLeadForDelete>>;

async function loadLeadForDelete(prisma: PrismaClient, id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      payments: true,
      project: true
    }
  });
}

function assertRepCanDeleteLead(lead: NonNullable<LeadForDelete>, user: User): void {
  assertLeadAccess(lead, user);
  assertLeadDeletable(lead);
}

export async function deleteLeadForUser(
  prisma: PrismaClient,
  user: User,
  leadId: string,
  request: FastifyRequest
): Promise<DeleteLeadResult> {
  const lead = await loadLeadForDelete(prisma, leadId);
  if (!lead) {
    return { ok: false, id: leadId, code: "NOT_FOUND", message: "Lead not found." };
  }

  if (user.role === UserRole.SALES_REP) {
    const scoped = await prisma.lead.findFirst({
      where: { id: leadId, ...repLeadScope(user.id) },
      select: { id: true }
    });
    if (!scoped) {
      return { ok: false, id: leadId, code: "NOT_FOUND", message: "Lead not found." };
    }
  }

  try {
    assertRepCanDeleteLead(lead, user);
  } catch (err) {
    if (err instanceof HttpError) {
      return { ok: false, id: leadId, code: err.code, message: err.message };
    }
    throw err;
  }

  await prisma.lead.delete({ where: { id: leadId } });

  await logActivity({
    prisma,
    userId: user.id,
    action: ActivityAction.DELETE,
    entityType: "Lead",
    entityId: leadId,
    before: {
      clientName: lead.clientName,
      status: lead.status,
      prospectCategory: lead.prospectCategory
    },
    request
  });

  return { ok: true, id: leadId };
}

export async function bulkDeleteLeadsForUser(
  prisma: PrismaClient,
  user: User,
  leadIds: string[],
  request: FastifyRequest
): Promise<{
  deleted: string[];
  failed: Array<{ id: string; code: string; message: string }>;
}> {
  const uniqueIds = [...new Set(leadIds.filter(Boolean))];
  const deleted: string[] = [];
  const failed: Array<{ id: string; code: string; message: string }> = [];

  for (const id of uniqueIds) {
    const result = await deleteLeadForUser(prisma, user, id, request);
    if (result.ok) {
      deleted.push(result.id);
    } else {
      failed.push({ id: result.id, code: result.code, message: result.message });
    }
  }

  return { deleted, failed };
}
