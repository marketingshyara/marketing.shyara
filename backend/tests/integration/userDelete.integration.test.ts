import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: delete user", () => {
  let adminId: string;
  let repId: string;
  let config: ReturnType<typeof loadConfig>;
  const repEmail = "it-del-rep@test.local";

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["it-del-admin@test.local", repEmail]
        }
      }
    });

    const admin = await prisma.user.create({
      data: {
        email: "it-del-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: repEmail,
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        commissionModel: "MODEL_A"
      }
    });
    repId = rep.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["it-del-admin@test.local", repEmail] } }
    });
    await prisma.$disconnect();
  });

  it("deleted rep is removed from DB; email can be re-created; sessions cleared", async () => {
    const app = await buildApp({ config });

    const repLogin = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: repEmail, password: "RepPass123!" }
    });
    expect(repLogin.statusCode).toBe(200);
    const repCookie = repLogin.cookies.find((c) => c.name === config.cookieName)!;

    const adminLogin = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-del-admin@test.local", password: "AdminPass123!" }
    });
    const adminCookie = adminLogin.cookies.find((c) => c.name === config.cookieName)!;

    const del = await inject(app, {
      method: "POST",
      url: `/api/users/${repId}/archive`,
      headers: { cookie: `${config.cookieName}=${adminCookie.value}` }
    });
    expect(del.statusCode).toBe(200);
    const delBody = del.json() as { deleted: boolean; email: string };
    expect(delBody.deleted).toBe(true);
    expect(delBody.email).toBe(repEmail);

    expect(await prisma.user.findUnique({ where: { id: repId } })).toBeNull();

    const loginAgain = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: repEmail, password: "RepPass123!" }
    });
    expect(loginAgain.statusCode).toBe(401);

    const session = await inject(app, {
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie: `${config.cookieName}=${repCookie.value}` }
    });
    expect(session.statusCode).toBe(200);
    expect((session.json() as { user: unknown }).user).toBeNull();

    const recreate = await inject(app, {
      method: "POST",
      url: "/api/users",
      headers: { cookie: `${config.cookieName}=${adminCookie.value}` },
      payload: {
        email: repEmail,
        role: "SALES_REP",
        commissionModel: "MODEL_A"
      }
    });
    expect(recreate.statusCode).toBe(201);

    const activeList = await inject(app, {
      method: "GET",
      url: "/api/users?status=active&page=1&pageSize=20",
      headers: { cookie: `${config.cookieName}=${adminCookie.value}` }
    });
    expect(activeList.statusCode).toBe(200);
    const activeBody = activeList.json() as { items: { email: string }[] };
    expect(activeBody.items.some((u) => u.email === repEmail)).toBe(true);

    const pastList = await inject(app, {
      method: "GET",
      url: "/api/users?status=past&page=1&pageSize=20",
      headers: { cookie: `${config.cookieName}=${adminCookie.value}` }
    });
    expect(pastList.statusCode).toBe(200);
    const pastBody = pastList.json() as { items: { email: string }[] };
    expect(pastBody.items.some((u) => u.email === repEmail)).toBe(false);

    await prisma.user.deleteMany({ where: { email: repEmail } });
    await app.close();
  });
});
