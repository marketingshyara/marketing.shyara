import bcrypt from "bcryptjs";
import { LeadStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { invalidatePortalSettingsCache } from "../../src/services/settings.js";
import { portalSettingsSchema } from "../../src/validators/schemas.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: commission amount sync when agreed total patched", () => {
  let adminId: string;
  let repId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ["agreed-sync-admin@test.local", "agreed-sync-rep@test.local"] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: "agreed-sync-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Agreed Sync Admin"
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: "agreed-sync-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Agreed Sync Rep"
      }
    });
    repId = rep.id;

    const values = portalSettingsSchema.parse({
      commissionRateBps: 1000
    });
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
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, repId] } }
    });
    await prisma.$disconnect();
  });

  it("updates unpaid commission amountCents when agreedTotalCents changes", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });

    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "agreed-sync-admin@test.local", password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();

    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Agreed sync lead",
        status: LeadStatus.NEW,
        agreedTotalCents: 10_000
      }
    });

    await prisma.commission.create({
      data: {
        leadId: lead.id,
        repUserId: repId,
        amountCents: 1000,
        isPaid: false
      }
    });

    const patch = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: `${config.cookieName}=${cookie!.value}` },
      payload: { agreedTotalCents: 50_000 }
    });
    expect(patch.statusCode).toBe(200);

    const commission = await prisma.commission.findUnique({ where: { leadId: lead.id } });
    expect(commission?.amountCents).toBe(5000);

    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });
});
