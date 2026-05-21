import bcrypt from "bcryptjs";
import { LeadStatus, PaymentKind, PaymentVerificationStatus, UserRole } from "@prisma/client";
import type { Lead, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { invalidatePortalSettingsCache } from "../../src/services/settings.js";
import { portalSettingsSchema } from "../../src/validators/schemas.js";
import { inject, DEFAULT_TEST_ORIGIN } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

/**
 * Combined integration coverage for the post-review fix set:
 *  - C1 payment verify race + stale state
 *  - C2 lead PATCH atomicity (commission rollback)
 *  - C4 audit-log durability inside the verify tx
 *  - M3 404 leak vs 403 enumeration
 *  - M8 CSRF origin guard
 *  - M9 banker's rounding integration
 *  - M5 login lockout
 *  - Trust-proxy disabled defends against spoofed X-Forwarded-For
 *  - PATCH /users accepts partial / nullable displayName
 */
d("portal review fixes - integration", () => {
  let adminId: string;
  let repId: string;
  let otherRepId: string;
  const adminEmail = "prf-admin@test.local";
  const repEmail = "prf-rep@test.local";
  const otherRepEmail = "prf-other-rep@test.local";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, repEmail, otherRepEmail] } }
    });
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "PRF Admin"
      }
    });
    adminId = admin.id;
    const rep = await prisma.user.create({
      data: {
        email: repEmail,
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "PRF Rep"
      }
    });
    repId = rep.id;
    const other = await prisma.user.create({
      data: {
        email: otherRepEmail,
        passwordHash: await bcrypt.hash("OtherPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "PRF Other"
      }
    });
    otherRepId = other.id;
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { createdByUserId: { in: [adminId, repId, otherRepId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId, otherRepId] } } });
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

  it("[M8] rejects POST without Origin header (CSRF guard)", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("CSRF_NO_ORIGIN");
    await app.close();
  });

  it("[M8] rejects POST with disallowed Origin", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { origin: "https://evil.example.com" },
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("CSRF_BAD_ORIGIN");
    await app.close();
  });

  it("[M3] returns 404 (not 403) when a rep accesses another rep's lead", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: otherRepId,
        clientName: "Other Lead",
        status: LeadStatus.NEW
      }
    });
    const { app, cookieHeader } = await loginAs(repEmail, "RepPass123!");
    const res = await inject(app, {
      method: "GET",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: cookieHeader }
    });
    expect(res.statusCode).toBe(404);
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("[C1] concurrent verify: exactly one wins, the other gets ALREADY_PROCESSED", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Race Lead",
        status: LeadStatus.NEW
      }
    });
    const payment = await prisma.leadPayment.create({
      data: {
        leadId: lead.id,
        kind: PaymentKind.ADVANCE,
        amountCents: 10000,
        markedByUserId: repId
      }
    });
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const results = await Promise.all([
      inject(app, {
        method: "POST",
        url: `/api/payments/${payment.id}/verify`,
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        payload: { decision: "VERIFIED", externalReference: "pay_race_1" }
      }),
      inject(app, {
        method: "POST",
        url: `/api/payments/${payment.id}/verify`,
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        payload: { decision: "VERIFIED", externalReference: "pay_race_2" }
      })
    ]);
    const statuses = results.map((r) => r.statusCode).sort();
    expect(statuses).toEqual([200, 400]);
    const loser = results.find((r) => r.statusCode === 400)!;
    const body = JSON.parse(loser.body);
    expect(["ALREADY_PROCESSED", "INVALID_STATE"]).toContain(body.error.code);
    const stored = await prisma.leadPayment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(stored.verificationStatus).toBe(PaymentVerificationStatus.VERIFIED);
    await prisma.leadPayment.delete({ where: { id: payment.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("concurrent pending-payment creation keeps at most one pending row", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Pending Uniqueness Lead",
        status: LeadStatus.NEW
      }
    });
    const { app, cookieHeader } = await loginAs(repEmail, "RepPass123!");
    const results = await Promise.all([
      inject(app, {
        method: "POST",
        url: `/api/leads/${lead.id}/payments`,
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        payload: { kind: "ADVANCE", amountCents: 1000 }
      }),
      inject(app, {
        method: "POST",
        url: `/api/leads/${lead.id}/payments`,
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        payload: { kind: "ADVANCE", amountCents: 1000 }
      })
    ]);

    const successCount = results.filter((r) => r.statusCode === 201).length;
    const conflictCount = results.filter((r) => r.statusCode === 409).length;
    expect(successCount).toBe(1);
    expect(conflictCount).toBe(1);
    for (const r of results.filter((x) => x.statusCode === 409)) {
      expect(JSON.parse(r.body).error.code).toBe("PENDING_PAYMENT");
    }

    const pendingRows = await prisma.leadPayment.count({
      where: {
        leadId: lead.id,
        kind: PaymentKind.ADVANCE,
        verificationStatus: PaymentVerificationStatus.PENDING
      }
    });
    expect(pendingRows).toBe(1);

    await prisma.leadPayment.deleteMany({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("[C1] verify fails with INVALID_STATE when lead has moved away from required status", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Stale Lead",
        status: LeadStatus.ADVANCE_PAID
      }
    });
    const payment = await prisma.leadPayment.create({
      data: {
        leadId: lead.id,
        kind: PaymentKind.ADVANCE,
        amountCents: 10000,
        markedByUserId: repId
      }
    });
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const res = await inject(app, {
      method: "POST",
      url: `/api/payments/${payment.id}/verify`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { decision: "VERIFIED", externalReference: "pay_stale_adv" }
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("INVALID_STATE");
    await prisma.leadPayment.delete({ where: { id: payment.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("[C4] auditLog failure inside verify-tx rolls back the lead+payment", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Audit Lead",
        status: LeadStatus.NEW
      }
    });
    const payment = await prisma.leadPayment.create({
      data: {
        leadId: lead.id,
        kind: PaymentKind.ADVANCE,
        amountCents: 10000,
        markedByUserId: repId
      }
    });
    // Use a Prisma proxy that throws on activityLog.create inside transactions.
    const realPrisma = prisma;
    const proxy = new Proxy(realPrisma, {
      get(target, key, receiver) {
        if (key === "activityLog") {
          return {
            create: async () => {
              throw new Error("audit failure injected");
            }
          };
        }
        if (key === "$transaction") {
          // Intercept transaction client returned to the callback and replace activityLog.create.
          return async (cb: (tx: unknown) => Promise<unknown>) => {
            return (realPrisma as unknown as { $transaction: (cb: (tx: unknown) => Promise<unknown>) => Promise<unknown> }).$transaction(
              async (txRaw: unknown) => {
                const tx = txRaw as Record<string, unknown>;
                const wrapped = new Proxy(tx, {
                  get(t, k) {
                    if (k === "activityLog") {
                      return {
                        create: async () => {
                          throw new Error("audit failure injected");
                        }
                      };
                    }
                    return Reflect.get(t, k);
                  }
                });
                return cb(wrapped);
              }
            );
          };
        }
        return Reflect.get(target, key, receiver);
      }
    });
    const config = loadConfig();
    const app = await buildApp({ config, prismaClient: proxy as typeof prisma });
    const loginRes = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    const cookie = loginRes.cookies.find((c) => c.name === config.cookieName);
    const cookieHeader = `${config.cookieName}=${cookie!.value}`;
    const res = await inject(app, {
      method: "POST",
      url: `/api/payments/${payment.id}/verify`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { decision: "VERIFIED", externalReference: "pay_audit_adv" }
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(500);
    // Use the real client to verify rollback.
    const after = await prisma.leadPayment.findUniqueOrThrow({ where: { id: payment.id } });
    expect(after.verificationStatus).toBe(PaymentVerificationStatus.PENDING);
    const leadAfter = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });
    expect(leadAfter.status).toBe(LeadStatus.NEW);
    await prisma.leadPayment.delete({ where: { id: payment.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("[C2] PATCH lead rolls back when the commission sync fails inside the tx", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Atomic Lead",
        status: LeadStatus.NEW,
        finalQuoteCents: 1000
      }
    });
    await prisma.commission.create({
      data: { leadId: lead.id, repUserId: repId, amountCents: 100, isPaid: false }
    });
    // Switch to FINAL_QUOTE basis so a finalQuoteCents change forces a commission.update.
    const settings = portalSettingsSchema.parse({
      commissionBasis: "FINAL_QUOTE",
      commissionRateBps: 2000
    });
    await prisma.portalSettings.upsert({
      where: { id: "default" },
      create: { id: "default", values: settings as object },
      update: { values: settings as object }
    });
    invalidatePortalSettingsCache();

    const realPrisma = prisma;
    const proxy = new Proxy(realPrisma, {
      get(target, key, receiver) {
        if (key === "$transaction") {
          return async (cb: (tx: unknown) => Promise<unknown>) =>
            (realPrisma as unknown as { $transaction: (cb: (tx: unknown) => Promise<unknown>) => Promise<unknown> }).$transaction(
              async (txRaw: unknown) => {
                const tx = txRaw as Record<string, unknown>;
                const wrapped = new Proxy(tx, {
                  get(t, k) {
                    if (k === "commission") {
                      const real = Reflect.get(t, k) as { update: unknown; findUnique: unknown };
                      return {
                        ...real,
                        update: async () => {
                          throw new Error("commission update injected failure");
                        }
                      };
                    }
                    return Reflect.get(t, k);
                  }
                });
                return cb(wrapped);
              }
            );
        }
        return Reflect.get(target, key, receiver);
      }
    });

    const config = loadConfig();
    const app = await buildApp({ config, prismaClient: proxy as typeof prisma });
    const loginRes = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    const cookie = loginRes.cookies.find((c) => c.name === config.cookieName);
    const cookieHeader = `${config.cookieName}=${cookie!.value}`;

    const beforeName = (await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } })).clientName;
    const res = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { clientName: "Should Roll Back", finalQuoteCents: 50_000 }
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(500);

    const after = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });
    expect(after.clientName).toBe(beforeName);
    expect(after.finalQuoteCents).toBe(1000);

    const commission = await prisma.commission.findUniqueOrThrow({ where: { leadId: lead.id } });
    expect(commission.amountCents).toBe(100);

    await prisma.commission.delete({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    const defaults = portalSettingsSchema.parse({});
    await prisma.portalSettings.update({
      where: { id: "default" },
      data: { values: defaults as object }
    });
    invalidatePortalSettingsCache();
    await app.close();
  });

  it("[patchUser partial] accepts { displayName: null } and {} no-op", async () => {
    const target = await prisma.user.create({
      data: {
        email: "prf-target@test.local",
        passwordHash: await bcrypt.hash("Pass123456!", 10),
        role: UserRole.SALES_REP,
        displayName: "to-clear"
      }
    });
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const r1 = await inject(app, {
      method: "PATCH",
      url: `/api/users/${target.id}`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { displayName: null }
    });
    expect(r1.statusCode).toBe(200);
    const cleared = await prisma.user.findUnique({ where: { id: target.id } });
    expect(cleared?.displayName).toBeNull();

    const r2 = await inject(app, {
      method: "PATCH",
      url: `/api/users/${target.id}`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: {}
    });
    expect(r2.statusCode).toBe(200);
    await prisma.user.delete({ where: { id: target.id } });
    await app.close();
  });

  it("cannot clear assignee when unpaid commission exists", async () => {
    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Assignment Guard Lead",
        status: LeadStatus.NEW
      }
    });
    await prisma.commission.create({
      data: { leadId: lead.id, repUserId: repId, amountCents: 100, isPaid: false }
    });
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const res = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${lead.id}`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: { assignedToUserId: null }
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe("ASSIGNEE_REQUIRED_FOR_COMMISSION");

    await prisma.commission.delete({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    await app.close();
  });

  it("[M9] verify deployment stage creates commission from agreed total using bankers rounding", async () => {
    const settings = portalSettingsSchema.parse({
      commissionRateBps: 3000,
      commissionRounding: "bankers"
    });
    await prisma.portalSettings.upsert({
      where: { id: "default" },
      create: { id: "default", values: settings as object },
      update: { values: settings as object }
    });
    invalidatePortalSettingsCache();

    const lead = await prisma.lead.create({
      data: {
        createdByUserId: adminId,
        assignedToUserId: repId,
        clientName: "Rounding Lead",
        status: LeadStatus.FINAL_PAID,
        agreedTotalCents: 5,
        advanceAmountCents: 2,
        finalQuoteCents: 3
      }
    });
    const project = await prisma.project.create({
      data: {
        leadId: lead.id,
        title: "Rounding project",
        deployedUrl: "https://example.com/live",
        deploymentSubmittedAt: new Date()
      }
    });
    const { app, cookieHeader } = await loginAs(adminEmail, "AdminPass123!");
    const res = await inject(app, {
      method: "POST",
      url: `/api/leads/${lead.id}/stages/deployment/verify`,
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      payload: {}
    });
    expect(res.statusCode).toBe(200);
    const commission = await prisma.commission.findUnique({ where: { leadId: lead.id } });
    // 5 * 3000 = 15000 / 10000 = 1.5 -> 2 (even).
    expect(commission?.amountCents).toBe(2);

    await prisma.commission.delete({ where: { leadId: lead.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    const defaults = portalSettingsSchema.parse({});
    await prisma.portalSettings.update({
      where: { id: "default" },
      data: { values: defaults as object }
    });
    invalidatePortalSettingsCache();
    await app.close();
  });

  it("[M5] locks an account after 5 consecutive failed logins", async () => {
    const user = await prisma.user.create({
      data: {
        email: "prf-lockout@test.local",
        passwordHash: await bcrypt.hash("Goodpass1!", 10),
        role: UserRole.SALES_REP,
        displayName: "Lockout"
      }
    });
    const config = loadConfig();
    const app = await buildApp({ config });
    for (let i = 0; i < 5; i++) {
      const res = await inject(app, {
        method: "POST",
        url: "/api/auth/login",
        payload: { email: user.email, password: "wrong" }
      });
      expect(res.statusCode).toBe(401);
    }
    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.lockedUntil).not.toBeNull();
    expect(after.lockedUntil!.getTime()).toBeGreaterThan(Date.now());

    // Correct password while locked still returns 401 with Retry-After.
    const locked = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: user.email, password: "Goodpass1!" }
    });
    expect(locked.statusCode).toBe(401);
    expect(locked.headers["retry-after"]).toBeDefined();

    // After we manually clear the lock, success resets the counter.
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedUntil: null, failedLoginAttempts: 0 }
    });
    const success = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: user.email, password: "Goodpass1!" }
    });
    expect(success.statusCode).toBe(200);
    const reset = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(reset.failedLoginAttempts).toBe(0);
    expect(reset.lockedUntil).toBeNull();
    await prisma.user.delete({ where: { id: user.id } });
    await app.close();
  });

  it("[C3] trust-proxy off: X-Forwarded-For is ignored in audit IP", async () => {
    // Force trustProxy off.
    const config = { ...loadConfig(), trustProxy: false };
    const app = await buildApp({ config });
    const before = await prisma.activityLog.count();
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      headers: {
        origin: DEFAULT_TEST_ORIGIN,
        "x-forwarded-for": "9.9.9.9, 1.1.1.1"
      },
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    expect(login.statusCode).toBe(200);
    // newest LOGIN row for this admin
    const row = await prisma.activityLog.findFirst({
      where: { userId: adminId, action: "LOGIN" },
      orderBy: { createdAt: "desc" }
    });
    expect(row).not.toBeNull();
    expect(row!.ip).not.toBe("9.9.9.9");
    // The injected test ip is "127.0.0.1" or similar - just assert it isn't the spoofed value.
    expect(await prisma.activityLog.count()).toBeGreaterThan(before);
    await app.close();
  });
});
