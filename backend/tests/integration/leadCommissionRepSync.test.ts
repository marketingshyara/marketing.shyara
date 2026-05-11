import bcrypt from "bcryptjs";
import { LeadStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: commission rep sync on lead assignment patch", () => {
  let adminId: string;
  let repAId: string;
  let repBId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["sync-admin@test.local", "sync-rep-a@test.local", "sync-rep-b@test.local"] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: "sync-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Sync Admin"
      }
    });
    adminId = admin.id;

    const repA = await prisma.user.create({
      data: {
        email: "sync-rep-a@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Rep A"
      }
    });
    repAId = repA.id;

    const repB = await prisma.user.create({
      data: {
        email: "sync-rep-b@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Rep B"
      }
    });
    repBId = repB.id;
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { createdByUserId: adminId } });
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, repAId, repBId] } }
    });
    await prisma.$disconnect();
  });

  it("updates unpaid commission repUserId when admin PATCHes assignedToUserId", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "sync-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repAId,
        clientName: "Sync Test Lead",
        status: LeadStatus.NEW
      }
    });

    await prisma.commission.create({
      data: {
        leadId: lead.id,
        repUserId: repAId,
        amountCents: 10_000,
        isPaid: false
      }
    });

    const patch = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: `${config.cookieName}=${cookie!.value}` },
      payload: { assignedToUserId: repBId }
    });
    expect(patch.statusCode).toBe(200);

    const commission = await prisma.commission.findUnique({ where: { leadId: lead.id } });
    expect(commission?.repUserId).toBe(repBId);

    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });
});
