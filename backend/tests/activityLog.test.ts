import { ActivityAction } from "@prisma/client";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { describe, expect, it, vi } from "vitest";
import { logActivity } from "../src/services/activityLog.js";

describe("logActivity", () => {
  it("does not throw when persistence fails outside a tx; logs warning", async () => {
    const create = vi.fn().mockRejectedValue(new Error("db unavailable"));
    const prisma = { activityLog: { create } } as unknown as PrismaClient;
    const logWarn = vi.fn();
    const request = {
      headers: {},
      ip: "1.1.1.1",
      log: { warn: logWarn, error: vi.fn() }
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
    expect(logWarn).toHaveBeenCalledTimes(1);
  });

  it("propagates the error when a tx client is supplied (so the parent tx rolls back)", async () => {
    const prismaCreate = vi.fn();
    const txCreate = vi.fn().mockRejectedValue(new Error("tx down"));
    const prisma = { activityLog: { create: prismaCreate } } as unknown as PrismaClient;
    const tx = {
      activityLog: { create: txCreate }
    } as unknown as Prisma.TransactionClient;
    const request = {
      headers: {},
      ip: "1.1.1.1",
      log: { warn: vi.fn(), error: vi.fn() }
    } as unknown as FastifyRequest;

    await expect(
      logActivity({
        prisma,
        tx,
        userId: "u1",
        action: ActivityAction.CREATE,
        entityType: "Lead",
        entityId: "e1",
        request
      })
    ).rejects.toThrow("tx down");

    expect(txCreate).toHaveBeenCalledTimes(1);
    expect(prismaCreate).not.toHaveBeenCalled();
  });

  it("uses request.ip rather than X-Forwarded-For", async () => {
    const create = vi.fn().mockResolvedValue({});
    const prisma = { activityLog: { create } } as unknown as PrismaClient;
    const request = {
      headers: { "x-forwarded-for": "9.9.9.9" },
      ip: "203.0.113.7",
      log: { warn: vi.fn(), error: vi.fn() }
    } as unknown as FastifyRequest;

    await logActivity({
      prisma,
      userId: "u1",
      action: ActivityAction.CREATE,
      entityType: "Lead",
      entityId: "e1",
      request
    });

    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].data.ip).toBe("203.0.113.7");
  });
});
