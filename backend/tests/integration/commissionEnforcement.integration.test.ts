import bcrypt from "bcryptjs";
import { LeadStatus, PaymentKind, PaymentVerificationStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { invalidatePortalSettingsCache } from "../../src/services/settings.js";
import { portalSettingsSchema } from "../../src/validators/schemas.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: commission settings enforcement", () => {
  let adminId: string;
  let repId: string;
  const adminEmail = "comm-enforce-admin@test.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, "comm-enforce-rep@test.local"] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Enforce Admin"
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: "comm-enforce-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Enforce Rep"
      }
    });
    repId = rep.id;

    const values = portalSettingsSchema.parse({
      minAgreedTotalCents: 799_900,
      commissionRateBps: 2000
    });
    await prisma.portalSettings.upsert({
      where: { id: "default" },
      create: { id: "default", values: values as object },
      update: { values: values as object }
    });
    invalidatePortalSettingsCache();
  });

  afterAll(async () => {
    const defaults = portalSettingsSchema.parse({});
    await prisma.portalSettings.upsert({
      where: { id: "default" },
      create: { id: "default", values: defaults as object },
      update: { values: defaults as object }
    });
    invalidatePortalSettingsCache();
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId] } } });
    await prisma.$disconnect();
  });

  async function loginAs() {
    const config = loadConfig();
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    return {
      app,
      cookieHeader: `${config.cookieName}=${cookie!.value}`
    };
  }

  it("rejects deployment verify when agreed total is below portal minimum", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Sub min",
        status: LeadStatus.FINAL_PAID,
        agreedTotalCents: 100_00,
        advanceAmountCents: 50_00,
        finalQuoteCents: 50_00,
        payments: {
          create: {
            kind: PaymentKind.FINAL,
            amountCents: 50_00,
            verificationStatus: PaymentVerificationStatus.VERIFIED,
            markedByUserId: repId,
            verifiedByUserId: adminId,
            verifiedAt: new Date()
          }
        }
      }
    });
    const project = await prisma.project.create({
      data: {
        leadId: lead.id,
        title: "Site",
        deployedUrl: "https://example.com",
        deploymentSubmittedAt: new Date()
      }
    });

    const { app, cookieHeader } = await loginAs();
    const res = await inject(app, {
      method: "POST",
      url: `/api/leads/${lead.id}/stages/deployment/verify`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: {}
    });
    expect(res.statusCode).toBe(400);
    expect((res.json() as { error: { code: string } }).error.code).toBe("MIN_PRICE");

    await prisma.project.delete({ where: { id: project.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("rejects mark-paid when commission cannot match portal settings", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Bad payout",
        status: LeadStatus.DEPLOYED,
        agreedTotalCents: 100_00,
        advanceAmountCents: 50_00,
        finalQuoteCents: 50_00
      }
    });
    await prisma.project.create({
      data: {
        leadId: lead.id,
        title: "Site",
        deployedUrl: "https://example.com/live",
        deploymentSubmittedAt: new Date(),
        deploymentVerifiedAt: new Date()
      }
    });
    const commission = await prisma.commission.create({
      data: {
        leadId: lead.id,
        repUserId: repId,
        amountCents: 400,
        isPaid: false
      }
    });

    const { app, cookieHeader } = await loginAs();
    const res = await inject(app, {
      method: "POST",
      url: `/api/commissions/${commission.id}/mark-paid`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: {}
    });
    expect(res.statusCode).toBe(400);
    expect((res.json() as { error: { code: string } }).error.code).toBe("COMMISSION_INVALID");

    await prisma.commission.delete({ where: { id: commission.id } });
    await prisma.project.deleteMany({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });
});
