import bcrypt from "bcryptjs";
import { LeadStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: GET /api/commissions list shape", () => {
  let adminId: string;
  let repId: string;
  let leadId: string;
  const adminEmail = "comm-list-admin@test.local";
  const repEmail = "comm-list-rep@test.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, repEmail] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Comm List Admin"
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: repEmail,
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Comm List Rep"
      }
    });
    repId = rep.id;

    const lead = await prisma.lead.create({
      data: {
        clientName: "List Test Client",
        status: LeadStatus.COMMISSION_PAID,
        createdByUserId: repId,
        assignedToUserId: repId,
        agreedTotalCents: 799_900,
        convertedAt: new Date()
      }
    });
    leadId = lead.id;

    await prisma.project.create({
      data: {
        leadId,
        deploymentVerifiedAt: new Date()
      }
    });

    await prisma.commission.create({
      data: {
        leadId,
        repUserId: repId,
        amountCents: 3_999,
        isPaid: true,
        paidAt: new Date()
      }
    });
  });

  afterAll(async () => {
    await prisma.commission.deleteMany({ where: { leadId } });
    await prisma.project.deleteMany({ where: { leadId } });
    await prisma.lead.deleteMany({ where: { id: leadId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId] } } });
    await prisma.$disconnect();
  });

  async function login(email: string, password: string) {
    const config = loadConfig();
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    return {
      app,
      cookieHeader: `${config.cookieName}=${cookie!.value}`
    };
  }

  it("returns expanded lead, rep, and summary for rep", async () => {
    const { app, cookieHeader } = await login(repEmail, "RepPass123!");
    const res = await inject(app, {
      method: "GET",
      url: "/api/commissions?page=1&pageSize=10",
      headers: { cookie: cookieHeader }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.summary).toMatchObject({
      total: 1,
      siteLive: 1,
      calculated: 1,
      paid: 1
    });
    expect(body.items[0].lead.agreedTotalCents).toBe(799_900);
    expect(body.items[0].lead.project.deploymentVerifiedAt).toBeTruthy();
    expect(body.items[0].rep.displayName).toBe("Comm List Rep");
  });

  it("admin sees all commissions", async () => {
    const { app, cookieHeader } = await login(adminEmail, "AdminPass123!");
    const res = await inject(app, {
      method: "GET",
      url: "/api/commissions?page=1&pageSize=10",
      headers: { cookie: cookieHeader }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().items.length).toBeGreaterThanOrEqual(1);
  });
});
