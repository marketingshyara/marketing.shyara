import type { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import * as bcryptLib from "../src/lib/bcrypt.js";
import { inject } from "./helpers/inject.js";
import { createMockPortalSessionModel } from "./helpers/mockPortalSession.js";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://u:p@127.0.0.1:5432/db";
}
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "01234567890123456789012345678901";
}

describe("auth login bcrypt edge cases", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when stored password hash is invalid (bcrypt throws)", async () => {
    vi.spyOn(bcryptLib, "safeBcryptCompare").mockResolvedValue(false);
    const config = loadConfig();
    const findUnique = vi.fn().mockResolvedValue({
      id: "user-1",
      email: "bad-hash@test.local",
      passwordHash: "not-a-valid-bcrypt-string",
      displayName: "X",
      role: UserRole.ADMIN,
      isActive: true,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null
    });
    const update = vi.fn().mockResolvedValue({});
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const mockPrisma = {
      user: { findUnique, update, updateMany },
      activityLog: { create: vi.fn().mockResolvedValue({}) },
      portalSession: createMockPortalSessionModel()
    } as unknown as PrismaClient;

    const app = await buildApp({ config, prismaClient: mockPrisma });
    const res = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "bad-hash@test.local", password: "whatever" }
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body) as { error?: { code?: string } };
    expect(body.error?.code).toBe("INVALID_CREDENTIALS");
    await app.close();
  });
});

describe("auth login session cookie max-age", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses longer Max-Age when rememberDevice is true", async () => {
    const prevMax = process.env.SESSION_MAX_AGE_SECONDS;
    const prevRem = process.env.SESSION_REMEMBER_ME_MAX_AGE_SECONDS;
    process.env.SESSION_MAX_AGE_SECONDS = "120";
    process.env.SESSION_REMEMBER_ME_MAX_AGE_SECONDS = "600";
    try {
      const config = loadConfig();
      const hash = await bcrypt.hash("secretpass", 4);
      const findUnique = vi.fn().mockResolvedValue({
        id: "user-1",
        email: "u@test.local",
        passwordHash: hash,
        displayName: "U",
        role: UserRole.ADMIN,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null
      });
      const update = vi.fn().mockResolvedValue({});
      const updateMany = vi.fn().mockResolvedValue({ count: 0 });
      const mockPrisma = {
        user: { findUnique, update, updateMany },
        activityLog: { create: vi.fn().mockResolvedValue({}) },
        portalSession: createMockPortalSessionModel()
      } as unknown as PrismaClient;

      function cookieExpiresMs(setCookie: string | string[] | undefined): number {
        const s = Array.isArray(setCookie) ? setCookie[0] : setCookie;
        const m = s ? /Expires=([^;]+)/i.exec(s) : null;
        if (!m) return NaN;
        return new Date(m[1].trim()).getTime();
      }

      const app = await buildApp({ config, prismaClient: mockPrisma });
      const resRemember = await inject(app, {
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "u@test.local", password: "secretpass", rememberDevice: true }
      });
      expect(resRemember.statusCode).toBe(200);
      const expRemember = cookieExpiresMs(resRemember.headers["set-cookie"]);
      await app.close();

      const app2 = await buildApp({ config, prismaClient: mockPrisma });
      const resNo = await inject(app2, {
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "u@test.local", password: "secretpass", rememberDevice: false }
      });
      expect(resNo.statusCode).toBe(200);
      const expNo = cookieExpiresMs(resNo.headers["set-cookie"]);
      await app2.close();

      expect(Number.isFinite(expRemember) && Number.isFinite(expNo)).toBe(true);
      expect(expRemember - expNo).toBeGreaterThan(450_000);
    } finally {
      if (prevMax !== undefined) process.env.SESSION_MAX_AGE_SECONDS = prevMax;
      else delete process.env.SESSION_MAX_AGE_SECONDS;
      if (prevRem !== undefined) process.env.SESSION_REMEMBER_ME_MAX_AGE_SECONDS = prevRem;
      else delete process.env.SESSION_REMEMBER_ME_MAX_AGE_SECONDS;
    }
  });
});
