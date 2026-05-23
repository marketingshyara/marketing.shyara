import bcrypt from "bcryptjs";
import { LeadStatus, PaymentKind, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { portalSettingsSchema } from "../../src/validators/schemas.js";
import { invalidatePortalSettingsCache } from "../../src/services/settings.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("live portal fixes — integration", () => {
  let adminId: string;
  let repId: string;
  const adminEmail = "lpf-admin@test.local";
  const repEmail = "lpf-rep@test.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, repEmail] } } });
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "LPF Admin"
      }
    });
    adminId = admin.id;
    const rep = await prisma.user.create({
      data: {
        email: repEmail,
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "LPF Rep"
      }
    });
    repId = rep.id;
  });

  afterAll(async () => {
    await prisma.leadPayment.deleteMany({ where: { markedByUserId: repId } });
    await prisma.lead.deleteMany({ where: { createdByUserId: { in: [adminId, repId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId] } } });
    const defaults = portalSettingsSchema.parse({});
    await prisma.portalSettings.upsert({
      where: { id: "default" },
      create: { id: "default", values: defaults as object },
      update: { values: defaults as object }
    });
    invalidatePortalSettingsCache();
    await prisma.$disconnect();
  });

  async function loginAs(email: string, password: string) {
    const config = loadConfig();
    const app = await buildApp({ config });
    const res = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password }
    });
    expect(res.statusCode).toBe(200);
    const cookie = res.cookies.find((c) => c.name === config.cookieName);
    return { app, config, cookieHeader: `${config.cookieName}=${cookie!.value}` };
  }

  it("GET /api/payments/pending returns rows for admin and 403 for rep", async () => {
    const { app: adminApp, cookieHeader: adminCookie } = await loginAs(adminEmail, "AdminPass123!");
    const leadRes = await inject(adminApp, {
      method: "POST",
      url: "/api/leads",
      headers: { cookie: adminCookie },
      payload: {
        clientName: "LPF Client",
        assignedToUserId: repId,
        agreedTotalCents: 100_00
      }
    });
    expect(leadRes.statusCode).toBe(201);
    const leadId = (JSON.parse(leadRes.body) as { lead: { id: string } }).lead.id;

    const { app: repApp, cookieHeader: repCookie } = await loginAs(repEmail, "RepPass123!");
    const markRes = await inject(repApp, {
      method: "POST",
      url: `/api/leads/${leadId}/payments`,
      headers: { cookie: repCookie },
      payload: { kind: PaymentKind.ADVANCE, amountCents: 50_00, repNote: "upi_id" }
    });
    expect(markRes.statusCode).toBe(201);

    const pending = await inject(adminApp, {
      method: "GET",
      url: "/api/payments/pending?page=1&pageSize=20",
      headers: { cookie: adminCookie }
    });
    expect(pending.statusCode).toBe(200);
    const body = JSON.parse(pending.body) as { items: { id: string }[]; total: number };
    expect(body.total).toBeGreaterThanOrEqual(1);

    const countRes = await inject(adminApp, {
      method: "GET",
      url: "/api/payments/pending/count",
      headers: { cookie: adminCookie }
    });
    expect(countRes.statusCode).toBe(200);
    expect((JSON.parse(countRes.body) as { total: number }).total).toBeGreaterThanOrEqual(1);

    const repPending = await inject(repApp, {
      method: "GET",
      url: "/api/payments/pending",
      headers: { cookie: repCookie }
    });
    expect(repPending.statusCode).toBe(403);

    await adminApp.close();
    await repApp.close();
  });

  it("GET /api/leads rejects assignedToUserId filter for sales rep", async () => {
    const { app, cookieHeader } = await loginAs(repEmail, "RepPass123!");
    const res = await inject(app, {
      method: "GET",
      url: `/api/leads?page=1&pageSize=20&assignedToUserId=${repId}`,
      headers: { cookie: cookieHeader }
    });
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body) as { error: { code: string } };
    expect(body.error.code).toBe("FORBIDDEN");
    await app.close();
  });

  it("GET /api/leads allows admin to filter by assignedToUserId", async () => {
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const res = await inject(app, {
      method: "GET",
      url: `/api/leads?page=1&pageSize=20&assignedToUserId=${repId}`,
      headers: { cookie: cookieHeader }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { items: { assignedToUserId: string | null }[] };
    for (const item of body.items) {
      expect(item.assignedToUserId).toBe(repId);
    }
    await app.close();
  });

  it("PATCH /api/leads/:id returns 409 on concurrent field updates (CAS)", async () => {
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const leadRes = await inject(app, {
      method: "POST",
      url: "/api/leads",
      headers: { cookie: cookieHeader },
      payload: {
        clientName: "Concurrent Lead",
        assignedToUserId: repId
      }
    });
    const leadId = (JSON.parse(leadRes.body) as { lead: { id: string } }).lead.id;

    const [a, b] = await Promise.all([
      inject(app, {
        method: "PATCH",
        url: `/api/leads/${leadId}`,
        headers: { cookie: cookieHeader },
        payload: { clientName: "Name A" }
      }),
      inject(app, {
        method: "PATCH",
        url: `/api/leads/${leadId}`,
        headers: { cookie: cookieHeader },
        payload: { clientName: "Name B" }
      })
    ]);
    const codes = [a.statusCode, b.statusCode].sort();
    expect(codes).toContain(200);
    expect(codes).toContain(409);

    await app.close();
  });
});
