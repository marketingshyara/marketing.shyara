import type { PrismaClient, User } from "@prisma/client";

export type LockoutConfig = {
  /** Number of consecutive failures that triggers a lock. */
  threshold: number;
  /** Lock duration in seconds. */
  windowSeconds: number;
};

export function isLocked(
  user: Pick<User, "lockedUntil">,
  now: Date = new Date()
): boolean {
  return user.lockedUntil != null && user.lockedUntil.getTime() > now.getTime();
}

export function remainingLockSeconds(
  user: Pick<User, "lockedUntil">,
  now: Date = new Date()
): number {
  if (user.lockedUntil == null) return 0;
  return Math.max(0, Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 1000));
}

/**
 * Increment the failure counter, locking the account for `windowSeconds` when the threshold is
 * reached. On lock the counter is reset so the next failure after the window starts a fresh count.
 */
export async function recordLoginFailure(
  prisma: PrismaClient,
  userId: string,
  config: LockoutConfig
): Promise<void> {
  const now = new Date();

  // Fast path: if already at/above threshold (from prior races), lock immediately.
  const lockFirst = await prisma.user.updateMany({
    where: {
      id: userId,
      failedLoginAttempts: { gte: config.threshold - 1 }
    },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: new Date(now.getTime() + config.windowSeconds * 1000)
    }
  });
  if (lockFirst.count > 0) return;

  // Count this failure atomically. Expired locks are cleared inline so counting can resume.
  await prisma.user.updateMany({
    where: {
      id: userId,
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }]
    },
    data: {
      failedLoginAttempts: { increment: 1 },
      lockedUntil: null
    }
  });

  // Second lock pass closes the race where concurrent increments cross the threshold together.
  await prisma.user.updateMany({
    where: {
      id: userId,
      failedLoginAttempts: { gte: config.threshold }
    },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: new Date(now.getTime() + config.windowSeconds * 1000)
    }
  });
}

/** Reset failure tracking after a successful authentication. */
export async function recordLoginSuccess(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null }
  });
}
