import { ActivityAction } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { describe, expect, it, vi } from "vitest";
import { logActivity } from "../src/services/activityLog.js";

describe("logActivity", () => {
  it("does not throw when persistence fails; logs error", async () => {
    const create = vi.fn().mockRejectedValue(new Error("db unavailable"));
    const prisma = { activityLog: { create } } as unknown as PrismaClient;
    const logError = vi.fn();
    const request = {
      headers: {},
      socket: {},
      log: { error: logError }
    } as unknown as FastifyRequest;

    await expect(
      logActivity({
        prisma,
        userId: "u1",
        action: ActivityAction.CREATE,
        entityType: "Lead",
        entityId: "e1",
        request
      })
    ).resolves.toBeUndefined();

    expect(create).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledTimes(1);
  });
});
