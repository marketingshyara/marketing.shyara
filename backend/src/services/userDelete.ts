import type { FastifyRequest } from "fastify";
import { ActivityAction, UserRole, type PrismaClient } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "./activityLog.js";
import { destroyPortalSessionsForUser } from "./userSessions.js";

async function assertCanDeleteAdmin(
  tx: Pick<PrismaClient, "user">,
  existing: { role: UserRole; isActive: boolean; archivedAt: Date | null }
): Promise<void> {
  if (existing.role !== UserRole.ADMIN || existing.archivedAt != null || !existing.isActive) {
    return;
  }
  const adminCount = await tx.user.count({
    where: { role: UserRole.ADMIN, isActive: true, archivedAt: null }
  });
  if (adminCount <= 1) {
    throw new HttpError(400, "LAST_ADMIN", "Cannot remove the last active admin.");
  }
}

/**
 * Permanently delete a portal user and release their email for re-registration.
 * Leads they created are reassigned to the acting admin; assigned leads are unassigned.
 */
export async function deleteUserForAdmin(
  prisma: PrismaClient,
  actorId: string,
  targetUserId: string,
  request?: FastifyRequest
): Promise<{ email: string }> {
  if (targetUserId === actorId) {
    throw new HttpError(400, "SELF_DELETE", "You cannot remove your own account.");
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
      throw new HttpError(404, "NOT_FOUND", "User not found.");
    }

    await assertCanDeleteAdmin(tx, existing);

    const email = existing.email;

    await tx.lead.updateMany({
      where: { createdByUserId: targetUserId },
      data: { createdByUserId: actorId }
    });

    await tx.lead.updateMany({
      where: { assignedToUserId: targetUserId },
      data: { assignedToUserId: null }
    });

    await tx.commission.deleteMany({ where: { repUserId: targetUserId } });

    await tx.leadProspectCategoryEvent.updateMany({
      where: { createdByUserId: targetUserId },
      data: { createdByUserId: actorId }
    });

    const paymentsMarked = await tx.leadPayment.findMany({
      where: { markedByUserId: targetUserId },
      select: { id: true, lead: { select: { createdByUserId: true } } }
    });
    for (const payment of paymentsMarked) {
      await tx.leadPayment.update({
        where: { id: payment.id },
        data: { markedByUserId: payment.lead.createdByUserId }
      });
    }

    await tx.leadPayment.updateMany({
      where: { verifiedByUserId: targetUserId },
      data: { verifiedByUserId: null }
    });

    await tx.commission.updateMany({
      where: { paidByAdminId: targetUserId },
      data: { paidByAdminId: null }
    });

    await tx.portalNotification.deleteMany({ where: { userId: targetUserId } });
    await tx.leadScraperPlaceView.deleteMany({ where: { userId: targetUserId } });

    await tx.leadScraperSearchCache.updateMany({
      where: { searchedByUserId: targetUserId },
      data: { searchedByUserId: null }
    });

    await tx.activityLog.updateMany({
      where: { userId: targetUserId },
      data: { userId: null }
    });

    await tx.user.delete({ where: { id: targetUserId } });

    return { email, role: existing.role };
  });

  await destroyPortalSessionsForUser(prisma, targetUserId);

  await logActivity({
    prisma,
    userId: actorId,
    action: ActivityAction.DELETE,
    entityType: "User",
    entityId: targetUserId,
    after: { email: deleted.email, role: deleted.role, deleted: true },
    request
  });

  return { email: deleted.email };
}
