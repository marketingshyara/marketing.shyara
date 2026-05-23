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

d("integration: auto commission from agreed total", () => {
  let adminId: string;
  let repId: string;
  const adminEmail = "auto-comm-admin@test.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, "auto-comm-rep@test.local"] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Auto Comm Admin"
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: "auto-comm-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Auto Comm Rep"
      }
    });
    repId = rep.id;

    const values = portalSettingsSchema.parse({ commissionRateBps: 2000 });
    await prisma.portalSettings.upsert({
      where: { id: "default" },
      create: { id: "default", values: values as object },
      update: { values: values as object }
    });
    invalidatePortalSettingsCache();
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { createdByUserId: adminId } });
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
      config,
      cookieHeader: `${config.cookieName}=${cookie!.value}`
    };
  }

  it("rejects PATCH commission amount with COMMISSION_AMOUNT_LOCKED", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Patch lock",
        status: LeadStatus.DEPLOYED,
        agreedTotalCents: 100_000
      }
    });
    const commission = await prisma.commission.create({
      data: { leadId: lead.id, repUserId: repId, amountCents: 20_000, isPaid: false }
    });

    const { app, cookieHeader } = await loginAs();
    const res = await inject(app, {
      method: "PATCH",
      url: `/api/commissions/${commission.id}`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { amountCents: 1 }
    });
    expect(res.statusCode).toBe(403);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("COMMISSION_AMOUNT_LOCKED");

    await prisma.commission.delete({ where: { id: commission.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("creates commission as 20% of agreed total not verified due on deploy verify", async () => {
    const agreedTotalCents = 799_900;
    const dueCents = 399_950;

    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "50/50 deal",
        status: LeadStatus.FINAL_PAID,
        agreedTotalCents,
        advanceAmountCents: dueCents,
        finalQuoteCents: dueCents,
        payments: {
          create: {
            kind: PaymentKind.FINAL,
            amountCents: dueCents,
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
        deployedUrl: "https://example.com/live",
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
    expect(res.statusCode).toBe(200);

    const commission = await prisma.commission.findUnique({ where: { leadId: lead.id } });
    expect(commission?.amountCents).toBe(159_980);
    expect(commission?.amountCents).not.toBe(Math.round(dueCents * 0.2));

    await prisma.commission.delete({ where: { leadId: lead.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("syncs stale unpaid commission on mark-paid", async () => {
    const agreedTotalCents = 799_900;
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Stale heal",
        status: LeadStatus.DEPLOYED,
        agreedTotalCents,
        advanceAmountCents: 399_950,
        finalQuoteCents: 399_950,
        payments: {
          create: {
            kind: PaymentKind.FINAL,
            amountCents: 399_950,
            verificationStatus: PaymentVerificationStatus.VERIFIED,
            markedByUserId: repId,
            verifiedByUserId: adminId,
            verifiedAt: new Date()
          }
        }
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
        amountCents: 79_995,
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
    expect(res.statusCode).toBe(200);
    const body = res.json() as { commission: { amountCents: number; isPaid: boolean } };
    expect(body.commission.isPaid).toBe(true);
    expect(body.commission.amountCents).toBe(159_980);

    await prisma.commission.delete({ where: { id: commission.id } });
    await prisma.project.deleteMany({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });
});
