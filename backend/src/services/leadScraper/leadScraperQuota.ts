import type { PrismaClient } from "@prisma/client";
import type { LeadScraperConfig } from "../../config.js";
import { HttpError } from "../../errors/httpError.js";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getResetDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString().split("T")[0]!;
}

async function ensureGlobalRow(prisma: PrismaClient, ym: string): Promise<void> {
  await prisma.leadScraperGlobalUsage.upsert({
    where: { yearMonth: ym },
    create: { yearMonth: ym, searchCount: 0 },
    update: {}
  });
}

export async function ensureUserQuotaRow(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string
): Promise<void> {
  const ym = currentMonth();
  const existing = await prisma.leadScraperUserQuota.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.leadScraperUserQuota.create({
      data: {
        userId,
        monthlyQuota: config.repDefaultQuota,
        searchesUsed: 0,
        quotaResetMonth: ym
      }
    });
    return;
  }
  if (existing.quotaResetMonth !== ym) {
    await prisma.leadScraperUserQuota.update({
      where: { userId },
      data: { searchesUsed: 0, quotaResetMonth: ym }
    });
  }
}

export type QuotaExhaustedReason = "USER" | "GLOBAL";

export function throwQuotaExceeded(
  usage: LeadScraperUsageResponse,
  reason: QuotaExhaustedReason
): never {
  if (reason === "GLOBAL") {
    throw new HttpError(
      429,
      "GLOBAL_QUOTA_EXCEEDED",
      `Organization search pool exhausted (${usage.global.used}/${usage.global.limit} this month). Resets on ${usage.resetsOn}. Contact admin.`,
      { usage }
    );
  }
  throw new HttpError(
    429,
    "QUOTA_EXCEEDED",
    `You've used ${usage.user.used}/${usage.user.limit} searches this month. Resets on ${usage.resetsOn}. Contact admin for buffer pool access.`,
    { usage }
  );
}

/**
 * Atomically reserves search quota (user + global). Throws QUOTA_EXCEEDED or GLOBAL_QUOTA_EXCEEDED on failure.
 */
export async function reserveSearchQuota(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string,
  userDisplay: { displayName: string | null; email: string; role: string },
  amount = 1
): Promise<void> {
  if (amount < 1) return;

  await ensureUserQuotaRow(prisma, config, userId);
  const ym = currentMonth();
  await ensureGlobalRow(prisma, ym);

  const exhausted = await prisma.$transaction(async (tx) => {
    const quota = await tx.leadScraperUserQuota.findUnique({ where: { userId } });
    const global = await tx.leadScraperGlobalUsage.findUnique({ where: { yearMonth: ym } });
    if (!quota || !global) return "USER" as QuotaExhaustedReason;

    if (global.searchCount + amount > config.maxSearchesPerMonth) {
      return "GLOBAL" as QuotaExhaustedReason;
    }
    if (quota.searchesUsed + amount > quota.monthlyQuota) {
      return "USER" as QuotaExhaustedReason;
    }

    const userUpdated = await tx.leadScraperUserQuota.updateMany({
      where: {
        userId,
        searchesUsed: quota.searchesUsed,
        monthlyQuota: quota.monthlyQuota
      },
      data: { searchesUsed: { increment: amount } }
    });
    if (userUpdated.count !== 1) {
      return "USER" as QuotaExhaustedReason;
    }

    const globalUpdated = await tx.leadScraperGlobalUsage.updateMany({
      where: { yearMonth: ym, searchCount: global.searchCount },
      data: { searchCount: { increment: amount } }
    });
    if (globalUpdated.count !== 1) {
      throw new Error("GLOBAL_QUOTA_RACE");
    }

    return null;
  });

  if (exhausted) {
    const usage = await getUserUsage(prisma, config, userId, userDisplay);
    throwQuotaExceeded(usage, exhausted);
  }
}

/** Release quota after a failed API call (best-effort). */
export async function releaseSearchQuota(
  prisma: PrismaClient,
  userId: string,
  amount = 1
): Promise<void> {
  if (amount < 1) return;
  const ym = currentMonth();
  await prisma.$transaction([
    prisma.leadScraperUserQuota.updateMany({
      where: { userId, searchesUsed: { gte: amount } },
      data: { searchesUsed: { decrement: amount } }
    }),
    prisma.leadScraperGlobalUsage.updateMany({
      where: { yearMonth: ym, searchCount: { gte: amount } },
      data: { searchCount: { decrement: amount } }
    })
  ]);
}

/** @deprecated Prefer reserveSearchQuota for API searches */
export async function canUserSearch(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string
): Promise<boolean> {
  await ensureUserQuotaRow(prisma, config, userId);
  const ym = currentMonth();
  await ensureGlobalRow(prisma, ym);
  const user = await prisma.leadScraperUserQuota.findUnique({ where: { userId } });
  if (!user) return false;
  const global = await prisma.leadScraperGlobalUsage.findUniqueOrThrow({ where: { yearMonth: ym } });
  return (
    user.searchesUsed < user.monthlyQuota && global.searchCount < config.maxSearchesPerMonth
  );
}

export type LeadScraperUsageResponse = {
  user: {
    id: string;
    name: string;
    role: string;
    used: number;
    limit: number;
    remaining: number;
  };
  global: {
    used: number;
    limit: number;
    remaining: number;
    resetsOn: string;
    month: string;
  };
  resetsOn: string;
};

export async function getUserUsage(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string,
  userDisplay: { displayName: string | null; email: string; role: string }
): Promise<LeadScraperUsageResponse> {
  await ensureUserQuotaRow(prisma, config, userId);
  const ym = currentMonth();
  await ensureGlobalRow(prisma, ym);

  const quota = await prisma.leadScraperUserQuota.findUniqueOrThrow({ where: { userId } });
  const global = await prisma.leadScraperGlobalUsage.findUniqueOrThrow({ where: { yearMonth: ym } });
  const resetsOn = getResetDate();

  return {
    user: {
      id: userId,
      name: userDisplay.displayName ?? userDisplay.email,
      role: userDisplay.role,
      used: quota.searchesUsed,
      limit: quota.monthlyQuota,
      remaining: Math.max(0, quota.monthlyQuota - quota.searchesUsed)
    },
    global: {
      used: global.searchCount,
      limit: config.maxSearchesPerMonth,
      remaining: Math.max(0, config.maxSearchesPerMonth - global.searchCount),
      resetsOn,
      month: ym
    },
    resetsOn
  };
}

export async function grantScraperQuota(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  targetUserId: string,
  amount: number
): Promise<{ granted: number; newLimit: number }> {
  if (amount < 1) {
    throw new HttpError(400, "VALIDATION_ERROR", "amount must be at least 1");
  }
  await ensureUserQuotaRow(prisma, config, targetUserId);
  const updated = await prisma.leadScraperUserQuota.update({
    where: { userId: targetUserId },
    data: { monthlyQuota: { increment: amount } }
  });
  return { granted: amount, newLimit: updated.monthlyQuota };
}

export async function getScraperQuotaForUser(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string
): Promise<{ monthlyQuota: number; searchesUsed: number; remaining: number } | null> {
  await ensureUserQuotaRow(prisma, config, userId);
  const fresh = await prisma.leadScraperUserQuota.findUniqueOrThrow({ where: { userId } });
  return {
    monthlyQuota: fresh.monthlyQuota,
    searchesUsed: fresh.searchesUsed,
    remaining: Math.max(0, fresh.monthlyQuota - fresh.searchesUsed)
  };
}
