import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

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

  it("admin cannot create leads (rep-only)", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const create = await inject(app, {
      method: "POST",
      url: "/api/leads",
      headers: {
        cookie: `${config.cookieName}=${cookie!.value}`,
        "content-type": "application/json"
      },
      payload: {
        clientName: "Blocked Lead",
        assignedToUserId: repId
      }
    });

    expect(create.statusCode).toBe(403);
    const body = JSON.parse(create.body);
    expect(body.error.code).toBe("FORBIDDEN");
    await app.close();
  });

  it("rep cannot list all users", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-rep@test.local", password: "RepPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const users = await inject(app, {
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

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const users = await inject(app, {
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

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const create = await inject(app, {
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

  it("admin can create another ADMIN user", async () => {
    await prisma.user.deleteMany({ where: { email: "it-second-admin@test.local" } });
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const create = await inject(app, {
      method: "POST",
      url: "/api/users",
      headers: {
        cookie: `${config.cookieName}=${cookie!.value}`,
        "content-type": "application/json"
      },
      payload: {
        email: "it-second-admin@test.local",
        role: "ADMIN",
        displayName: "Second Admin"
      }
    });

    expect(create.statusCode).toBe(201);
    const body = JSON.parse(create.body);
    expect(body.user.role).toBe("ADMIN");
    expect(body.user.email).toBe("it-second-admin@test.local");
    expect(body.temporaryPassword).toBeDefined();
    expect(body.user.mustChangePassword).toBe(true);

    await prisma.user.deleteMany({ where: { email: "it-second-admin@test.local" } });
    await app.close();
  });

  it("admin create duplicate email returns 409", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const dup = await inject(app, {
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

  it("mustChangePassword user is blocked from protected routes until password is changed", async () => {
    await prisma.user.deleteMany({ where: { email: "it-mustchange@test.local" } });
    await prisma.user.create({
      data: {
        email: "it-mustchange@test.local",
        passwordHash: await bcrypt.hash("TempPass123!", 10),
        role: UserRole.SALES_REP,
        mustChangePassword: true
      }
    });
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-mustchange@test.local", password: "TempPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();
    const cookieHeader = `${config.cookieName}=${cookie!.value}`;

    const blocked = await inject(app, {
      method: "GET",
      url: "/api/leads",
      headers: { cookie: cookieHeader }
    });
    expect(blocked.statusCode).toBe(403);
    expect(JSON.parse(blocked.body).error.code).toBe("PASSWORD_CHANGE_REQUIRED");

    const change = await inject(app, {
      method: "POST",
      url: "/api/auth/change-password",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { newPassword: "ChangedPass123!" }
    });
    expect(change.statusCode).toBe(200);
    const changeBody = JSON.parse(change.body);
    expect(changeBody.user.mustChangePassword).toBe(false);

    const allowed = await inject(app, {
      method: "GET",
      url: "/api/leads",
      headers: { cookie: cookieHeader }
    });
    expect(allowed.statusCode).toBe(200);

    await prisma.user.deleteMany({ where: { email: "it-mustchange@test.local" } });
    await app.close();
  });

  it("voluntary change-password requires and validates current password", async () => {
    await prisma.user.deleteMany({ where: { email: "it-voluntary-pw@test.local" } });
    await prisma.user.create({
      data: {
        email: "it-voluntary-pw@test.local",
        passwordHash: await bcrypt.hash("KnownPass123!", 10),
        role: UserRole.SALES_REP,
        mustChangePassword: false
      }
    });
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-voluntary-pw@test.local", password: "KnownPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();
    const cookieHeader = `${config.cookieName}=${cookie!.value}`;

    const missingCurrent = await inject(app, {
      method: "POST",
      url: "/api/auth/change-password",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { newPassword: "NewPass456!" }
    });
    expect(missingCurrent.statusCode).toBe(400);
    expect(JSON.parse(missingCurrent.body).error.code).toBe("VALIDATION_ERROR");

    const wrongCurrent = await inject(app, {
      method: "POST",
      url: "/api/auth/change-password",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { currentPassword: "WrongPass123!", newPassword: "NewPass456!" }
    });
    expect(wrongCurrent.statusCode).toBe(400);
    expect(JSON.parse(wrongCurrent.body).error.code).toBe("INVALID_PASSWORD");

    const ok = await inject(app, {
      method: "POST",
      url: "/api/auth/change-password",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { currentPassword: "KnownPass123!", newPassword: "NewPass456!" }
    });
    expect(ok.statusCode).toBe(200);

    await prisma.user.deleteMany({ where: { email: "it-voluntary-pw@test.local" } });
    await app.close();
  });

  it("reset-password returns updated user payload", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const reset = await inject(app, {
      method: "POST",
      url: `/api/users/${repId}/reset-password`,
      headers: {
        cookie: `${config.cookieName}=${cookie!.value}`,
        "content-type": "application/json"
      },
      payload: { temporaryPassword: "RepPass456!" }
    });
    expect(reset.statusCode).toBe(200);
    const body = JSON.parse(reset.body);
    expect(body.user).toBeDefined();
    expect(body.user.id).toBe(repId);
    expect(body.user.mustChangePassword).toBe(true);

    await app.close();
  });
});
