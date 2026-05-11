import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  isLocked,
  recordLoginFailure,
  recordLoginSuccess,
  remainingLockSeconds
} from "../src/lib/loginLockout.js";

const config = { threshold: 5, windowSeconds: 900 };

function makeMockPrisma(initial: { failedLoginAttempts: number }) {
  const updateManyCalls: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }> = [];
  const updateCalls: Array<{ where: { id: string }; data: Record<string, unknown> }> = [];
  let currentAttempts = initial.failedLoginAttempts;

  const updateMany = vi.fn().mockImplementation(async (call: typeof updateManyCalls[number]) => {
    updateManyCalls.push(call);
    const failedLoginFilter = call.where.failedLoginAttempts as { gte?: number } | undefined;
    if (failedLoginFilter?.gte !== undefined) {
      const matched = currentAttempts >= failedLoginFilter.gte ? 1 : 0;
      if (matched > 0) {
        if (typeof call.data.failedLoginAttempts === "number") {
          currentAttempts = call.data.failedLoginAttempts;
        }
      }
      return { count: matched };
    }
    if (call.data.failedLoginAttempts && typeof call.data.failedLoginAttempts === "object") {
      const inc = (call.data.failedLoginAttempts as { increment?: number }).increment ?? 0;
      currentAttempts += inc;
      return { count: 1 };
    }
    return { count: 0 };
  });
  const update = vi.fn().mockImplementation(async (call: typeof updateCalls[number]) => {
    updateCalls.push(call);
    return {};
  });
  const prisma = { user: { updateMany, update } } as unknown as PrismaClient;
  return { prisma, updateCalls, updateManyCalls, updateMany, update };
}

describe("loginLockout helpers", () => {
  it("isLocked returns true only while lockedUntil is in the future", () => {
    const future = new Date(Date.now() + 60_000);
    const past = new Date(Date.now() - 60_000);
    expect(isLocked({ lockedUntil: future })).toBe(true);
    expect(isLocked({ lockedUntil: past })).toBe(false);
    expect(isLocked({ lockedUntil: null })).toBe(false);
  });

  it("remainingLockSeconds clamps to >= 0 and rounds up", () => {
    const future = new Date(Date.now() + 1500);
    expect(remainingLockSeconds({ lockedUntil: future })).toBeGreaterThan(0);
    expect(remainingLockSeconds({ lockedUntil: null })).toBe(0);
  });

  it("recordLoginFailure increments below threshold and does not lock", async () => {
    const { prisma, updateManyCalls } = makeMockPrisma({ failedLoginAttempts: 0 });
    await recordLoginFailure(prisma, "u1", config);
    expect(updateManyCalls).toHaveLength(3);
    expect(updateManyCalls[1].data).toEqual({ failedLoginAttempts: { increment: 1 }, lockedUntil: null });
  });

  it("recordLoginFailure locks the account at threshold and resets the counter", async () => {
    const { prisma, updateManyCalls } = makeMockPrisma({ failedLoginAttempts: 4 });
    await recordLoginFailure(prisma, "u1", config);
    expect(updateManyCalls).toHaveLength(1);
    const data = updateManyCalls[0].data as { failedLoginAttempts: number; lockedUntil: Date };
    expect(data.failedLoginAttempts).toBe(0);
    expect(data.lockedUntil).toBeInstanceOf(Date);
    expect(data.lockedUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it("recordLoginSuccess resets the counter and clears the lock", async () => {
    const { prisma, updateCalls } = makeMockPrisma({ failedLoginAttempts: 3 });
    await recordLoginSuccess(prisma, "u1");
    expect(updateCalls[0].data).toEqual({ failedLoginAttempts: 0, lockedUntil: null });
  });

  it("is a no-op when the user lookup returns null", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const prisma = { user: { updateMany } } as unknown as PrismaClient;
    await recordLoginFailure(prisma, "missing", config);
    expect(updateMany).toHaveBeenCalled();
  });
});
