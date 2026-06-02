import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: archive user", () => {
  let adminId: string;
  let repId: string;
  let config: ReturnType<typeof loadConfig>;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["it-arch-admin@test.local", "it-arch-rep@test.local"]
        }
      }
    });

    const admin = await prisma.user.create({
      data: {
        email: "it-arch-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: "it-arch-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    repId = rep.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId] } } });
    await prisma.$disconnect();
  });

  it("archived rep cannot login; session cleared; protected route 401", async () => {
    const app = await buildApp({ config });

    const repLogin = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-arch-rep@test.local", password: "RepPass123!" }
    });
    expect(repLogin.statusCode).toBe(200);
    const repCookie = repLogin.cookies.find((c) => c.name === config.cookieName)!;

    const adminLogin = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-arch-admin@test.local", password: "AdminPass123!" }
    });
    const adminCookie = adminLogin.cookies.find((c) => c.name === config.cookieName)!;

    const archive = await inject(app, {
      method: "POST",
      url: `/api/users/${repId}/archive`,
      headers: { cookie: `${config.cookieName}=${adminCookie.value}` }
    });
    expect(archive.statusCode).toBe(200);

    const loginAgain = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-arch-rep@test.local", password: "RepPass123!" }
    });
    expect(loginAgain.statusCode).toBe(401);

    const session = await inject(app, {
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie: `${config.cookieName}=${repCookie.value}` }
    });
    expect(session.statusCode).toBe(200);
    expect((session.json() as { user: unknown }).user).toBeNull();

    const protectedRoute = await inject(app, {
      method: "GET",
      url: "/api/settings",
      headers: { cookie: `${config.cookieName}=${repCookie.value}` }
    });
    expect(protectedRoute.statusCode).toBe(401);

    const pastList = await inject(app, {
      method: "GET",
      url: "/api/users?status=past&page=1&pageSize=20",
      headers: { cookie: `${config.cookieName}=${adminCookie.value}` }
    });
    expect(pastList.statusCode).toBe(200);
    const pastBody = pastList.json() as { items: { id: string }[] };
    expect(pastBody.items.some((u) => u.id === repId)).toBe(true);

    await app.close();
  });
});
