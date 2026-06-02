import {
  PortalNotificationKind,
  UserRole,
  type Prisma,
  type PrismaClient,
  type User
} from "@prisma/client";

type WriteDb = Prisma.TransactionClient | PrismaClient;

/** Role-scoped inbox filter: reps see admin decisions on their leads only; admins see rep submissions. */
export function notificationVisibilityWhere(
  user: Pick<User, "id" | "role">,
  options?: { unreadOnly?: boolean }
): Prisma.PortalNotificationWhereInput {
  const base: Prisma.PortalNotificationWhereInput = {
    userId: user.id,
    ...(options?.unreadOnly ? { readAt: null } : {})
  };

  if (user.role === UserRole.ADMIN) {
    return {
      ...base,
      kind: PortalNotificationKind.REP_SUBMITTED
    };
  }

  return {
    ...base,
    kind: {
      in: [PortalNotificationKind.ADMIN_VERIFIED, PortalNotificationKind.ADMIN_DECLINED]
    },
    lead: {
      OR: [{ assignedToUserId: user.id }, { createdByUserId: user.id }]
    }
  };
}

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
    where: {
      role: UserRole.ADMIN,
      isActive: true,
      archivedAt: null,
      ...(params.excludeUserId ? { id: { not: params.excludeUserId } } : {})
    },
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

export async function notifyRepOfAdminDecision(
  tx: WriteDb,
  params: {
    leadId: string;
    repUserId: string | null;
    kind: Extract<PortalNotificationKind, "ADMIN_VERIFIED" | "ADMIN_DECLINED">;
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

export async function unreadNotificationCount(
  prisma: PrismaClient,
  user: Pick<User, "id" | "role">
): Promise<number> {
  return prisma.portalNotification.count({
    where: notificationVisibilityWhere(user, { unreadOnly: true })
  });
}
