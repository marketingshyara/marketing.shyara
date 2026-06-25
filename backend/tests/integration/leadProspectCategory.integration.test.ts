import bcrypt from "bcryptjs";
import { LeadStatus, ProspectCategory, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: prospect category", () => {
  let repId: string;
  let adminId: string;
  let leadId: string;
  let config: ReturnType<typeof loadConfig>;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["it-pc-rep@test.local", "it-pc-admin@test.local"]
        }
      }
    });

    const rep = await prisma.user.create({
      data: {
        email: "it-pc-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    repId = rep.id;

    const admin = await prisma.user.create({
      data: {
        email: "it-pc-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });
    adminId = admin.id;

    const lead = await prisma.lead.create({
      data: {
        clientName: "Prospect Category Test",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId,
        prospectCategory: ProspectCategory.NEW_LEAD
      }
    });
    leadId = lead.id;
    await prisma.leadProspectCategoryEvent.create({
      data: {
        leadId,
        category: ProspectCategory.NEW_LEAD,
        createdByUserId: repId
      }
    });
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { assignedToUserId: repId } });
    await prisma.user.deleteMany({ where: { id: { in: [repId, adminId] } } });
    await prisma.$disconnect();
  });

  async function repCookie() {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-pc-rep@test.local", password: "RepPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;
    await app.close();
    return cookie.value;
  }

  async function adminCookie() {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-pc-admin@test.local", password: "AdminPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;
    await app.close();
    return cookie.value;
  }

  it("requires sampleShared when marking interested", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    const missing = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "INTERESTED" }
    });
    expect(missing.statusCode).toBe(400);

    const ok = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "INTERESTED", sampleShared: false }
    });
    expect(ok.statusCode).toBe(200);
    const body = ok.json() as {
      lead: { prospectCategory: string; interestedSampleShared: boolean };
    };
    expect(body.lead.prospectCategory).toBe("INTERESTED");
    expect(body.lead.interestedSampleShared).toBe(false);

    await app.close();
  });

  it("allows interested sample flip and appends history", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    const flip = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "INTERESTED", sampleShared: true }
    });
    expect(flip.statusCode).toBe(200);

    const events = await inject(app, {
      method: "GET",
      url: `/api/leads/${leadId}/prospect-category-events?page=1&pageSize=20`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const eventsBody = events.json() as {
      items: { category: string; sampleShared: boolean | null }[];
    };
    expect(eventsBody.items.length).toBeGreaterThanOrEqual(2);
    expect(eventsBody.items[0]?.sampleShared).toBe(true);
    expect(eventsBody.items[1]?.sampleShared).toBe(false);

    await app.close();
  });

  it("rejects no-op interested re-submit", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    const again = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "INTERESTED", sampleShared: true }
    });
    expect(again.statusCode).toBe(409);
    const body = again.json() as { error: { code: string } };
    expect(body.error.code).toBe("SAME_PROSPECT_CATEGORY");

    await app.close();
  });

  it("allows callback requested without datetime", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    const res = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "CALLBACK_REQUESTED" }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { lead: { prospectCategory: string; callbackScheduledAt: string | null } };
    expect(body.lead.prospectCategory).toBe("CALLBACK_REQUESTED");
    expect(body.lead.callbackScheduledAt).toBeNull();

    await app.close();
  });

  it("stores callback datetime", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();
    const callbackAt = new Date(Date.now() + 86_400_000).toISOString();

    const res = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "CALLBACK_REQUESTED", callbackAt }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { lead: { callbackScheduledAt: string } };
    expect(new Date(body.lead.callbackScheduledAt).toISOString()).toBe(callbackAt);

    const list = await inject(app, {
      method: "GET",
      url: "/api/leads?view=leads&prospectCategory=CALLBACK_REQUESTED&page=1&pageSize=50",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const listBody = list.json() as { items: { id: string }[] };
    expect(listBody.items.some((i) => i.id === leadId)).toBe(true);

    await app.close();
  });

  it("admin can set prospect category", async () => {
    const app = await buildApp({ config });
    const cookie = await adminCookie();

    const res = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { category: "FOLLOW_UP", note: "Admin follow-up" }
    });
    expect(res.statusCode).toBe(200);

    await app.close();
  });

  it("admin rep leads list filters by prospect category", async () => {
    const app = await buildApp({ config });
    const repCk = await repCookie();
    const adminCk = await adminCookie();

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/prospect-category`,
      headers: { cookie: `${config.cookieName}=${repCk}` },
      payload: { category: "INTERESTED", sampleShared: true }
    });

    const filtered = await inject(app, {
      method: "GET",
      url: `/api/team/reps/${repId}/leads?view=leads&prospectCategory=INTERESTED&page=1&pageSize=50`,
      headers: { cookie: `${config.cookieName}=${adminCk}` }
    });
    expect(filtered.statusCode).toBe(200);
    const body = filtered.json() as { items: { id: string }[] };
    expect(body.items.some((i) => i.id === leadId)).toBe(true);

    const other = await inject(app, {
      method: "GET",
      url: `/api/team/reps/${repId}/leads?view=leads&prospectCategory=NEW_LEAD&page=1&pageSize=50`,
      headers: { cookie: `${config.cookieName}=${adminCk}` }
    });
    const otherBody = other.json() as { items: { id: string }[] };
    expect(otherBody.items.some((i) => i.id === leadId)).toBe(false);

    await app.close();
  });
});
