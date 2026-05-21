import { PortalNotificationKind, UserRole, type Prisma, type PrismaClient } from "@prisma/client";

type WriteDb = Prisma.TransactionClient | PrismaClient;

export async function notifyActiveAdmins(
  tx: WriteDb,
  params: {
    leadId: string;
    kind: PortalNotificationKind;
    stageKey?: string | null;
    message: string;
    excludeUserId?: string;
  }
): Promise<void> {
  const admins = await tx.user.findMany({
    where: { role: UserRole.ADMIN, isActive: true, ...(params.excludeUserId ? { id: { not: params.excludeUserId } } : {}) },
    select: { id: true }
  });
  if (admins.length === 0) return;
  await tx.portalNotification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      leadId: params.leadId,
      kind: params.kind,
      stageKey: params.stageKey ?? null,
      message: params.message
    }))
  });
}

export async function notifyUser(
  tx: WriteDb,
  params: {
    userId: string;
    leadId: string;
    kind: PortalNotificationKind;
    stageKey?: string | null;
    message: string;
  }
): Promise<void> {
  await tx.portalNotification.create({
    data: {
      userId: params.userId,
      leadId: params.leadId,
      kind: params.kind,
      stageKey: params.stageKey ?? null,
      message: params.message
    }
  });
}

/** Notify assignee rep and all admins when rep submits for review. */
export async function notifyRepSubmitted(
  tx: WriteDb,
  params: {
    leadId: string;
    repUserId: string | null;
    stageKey: string;
    message: string;
    actorUserId: string;
  }
): Promise<void> {
  await notifyActiveAdmins(tx, {
    leadId: params.leadId,
    kind: PortalNotificationKind.REP_SUBMITTED,
    stageKey: params.stageKey,
    message: params.message,
    excludeUserId: params.actorUserId
  });
  if (params.repUserId && params.repUserId !== params.actorUserId) {
    // Rep is actor; admins already notified
  }
}

export async function notifyRepOfAdminDecision(
  tx: WriteDb,
  params: {
    leadId: string;
    repUserId: string | null;
    kind: PortalNotificationKind.ADMIN_VERIFIED | PortalNotificationKind.ADMIN_DECLINED;
    stageKey: string;
    message: string;
  }
): Promise<void> {
  if (!params.repUserId) return;
  await notifyUser(tx, {
    userId: params.repUserId,
    leadId: params.leadId,
    kind: params.kind,
    stageKey: params.stageKey,
    message: params.message
  });
}

export async function unreadNotificationCount(prisma: PrismaClient, userId: string): Promise<number> {
  return prisma.portalNotification.count({
    where: { userId, readAt: null }
  });
}
