import bcrypt from "bcryptjs";
import { LeadStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: delete prospect", () => {
  let repId: string;
  let otherRepId: string;
  let leadId: string;
  let config: ReturnType<typeof loadConfig>;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: { email: { in: ["it-del-rep@test.local", "it-del-other@test.local"] } }
    });

    const rep = await prisma.user.create({
      data: {
        email: "it-del-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    repId = rep.id;

    const other = await prisma.user.create({
      data: {
        email: "it-del-other@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    otherRepId = other.id;

    const lead = await prisma.lead.create({
      data: {
        clientName: "Delete Me",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });
    leadId = lead.id;
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { id: leadId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [repId, otherRepId] } } });
    await prisma.$disconnect();
  });

  it("rep can delete own unconverted prospect", async () => {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-del-rep@test.local", password: "RepPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;

    const del = await inject(app, {
      method: "DELETE",
      url: `/api/leads/${leadId}`,
      headers: { cookie: `${config.cookieName}=${cookie.value}` }
    });
    expect(del.statusCode).toBe(200);
    const gone = await prisma.lead.findUnique({ where: { id: leadId } });
    expect(gone).toBeNull();
    await app.close();
  });

  it("admin cannot delete prospect via API", async () => {
    const lead = await prisma.lead.create({
      data: {
        clientName: "Admin blocked",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });

    await prisma.user.deleteMany({ where: { email: "it-del-admin@test.local" } });
    const admin = await prisma.user.create({
      data: {
        email: "it-del-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });

    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-del-admin@test.local", password: "AdminPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;

    const del = await inject(app, {
      method: "DELETE",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: `${config.cookieName}=${cookie.value}` }
    });
    expect(del.statusCode).toBe(403);
    const body = del.json() as { error: { code: string } };
    expect(body.error.code).toBe("NOT_SALES_REP");

    await prisma.lead.delete({ where: { id: lead.id } });
    await prisma.user.delete({ where: { id: admin.id } });
    await app.close();
  });

  it("other rep cannot delete foreign prospect", async () => {
    const lead = await prisma.lead.create({
      data: {
        clientName: "Foreign",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });

    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-del-other@test.local", password: "RepPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;

    const del = await inject(app, {
      method: "DELETE",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: `${config.cookieName}=${cookie.value}` }
    });
    expect(del.statusCode).toBe(404);
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });
});
