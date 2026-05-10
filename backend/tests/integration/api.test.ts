import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: auth and RBAC", () => {
  let adminId: string;
  let repId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["it-admin@test.local", "it-rep@test.local"] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: "it-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "IT Admin"
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: "it-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "IT Rep"
      }
    });
    repId = rep.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, repId] } }
    });
    await prisma.$disconnect();
  });

  it("rep cannot list all users", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-rep@test.local", password: "RepPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const users = await app.inject({
      method: "GET",
      url: "/api/users",
      headers: { cookie: `${config.cookieName}=${cookie!.value}` }
    });

    expect(users.statusCode).toBe(403);
    await app.close();
  });

  it("admin can list users", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const users = await app.inject({
      method: "GET",
      url: "/api/users",
      headers: { cookie: `${config.cookieName}=${cookie!.value}` }
    });

    expect(users.statusCode).toBe(200);
    const body = JSON.parse(users.body);
    expect(body.total).toBeGreaterThanOrEqual(2);
    await app.close();
  });

  it("admin create user without password sets mustChangePassword true even if client sends false", async () => {
    await prisma.user.deleteMany({ where: { email: "it-created-nopw@test.local" } });
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const create = await app.inject({
      method: "POST",
      url: "/api/users",
      headers: {
        cookie: `${config.cookieName}=${cookie!.value}`,
        "content-type": "application/json"
      },
      payload: {
        email: "it-created-nopw@test.local",
        role: "SALES_REP",
        mustChangePassword: false
      }
    });

    expect(create.statusCode).toBe(201);
    const created = JSON.parse(create.body);
    expect(created.temporaryPassword).toBeDefined();
    expect(created.user.mustChangePassword).toBe(true);

    const row = await prisma.user.findUnique({ where: { email: "it-created-nopw@test.local" } });
    expect(row?.mustChangePassword).toBe(true);

    await prisma.user.deleteMany({ where: { email: "it-created-nopw@test.local" } });
    await app.close();
  });

  it("admin create duplicate email returns 409", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const dup = await app.inject({
      method: "POST",
      url: "/api/users",
      headers: {
        cookie: `${config.cookieName}=${cookie!.value}`,
        "content-type": "application/json"
      },
      payload: {
        email: "it-rep@test.local",
        role: "SALES_REP",
        password: "SomePass123456!"
      }
    });

    expect(dup.statusCode).toBe(409);
    const body = JSON.parse(dup.body);
    expect(body.error.code).toBe("EMAIL_IN_USE");

    await app.close();
  });
});
