import type { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

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
    const config = loadConfig();
    const findUnique = vi.fn().mockResolvedValue({
      id: "user-1",
      email: "bad-hash@test.local",
      passwordHash: "not-a-valid-bcrypt-string",
      displayName: "X",
      role: UserRole.ADMIN,
      isActive: true,
      mustChangePassword: false
    });
    const mockPrisma = {
      user: { findUnique },
      activityLog: { create: vi.fn().mockResolvedValue({}) }
    } as unknown as PrismaClient;

    const app = await buildApp({ config, prismaClient: mockPrisma });
    const res = await app.inject({
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
