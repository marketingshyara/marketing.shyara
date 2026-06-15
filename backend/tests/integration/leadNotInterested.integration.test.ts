import bcrypt from "bcryptjs";
import { LeadStatus, ProspectCategory, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: not interested prospects", () => {
  let repId: string;
  let adminId: string;
  let otherRepId: string;
  let leadId: string;
  let config: ReturnType<typeof loadConfig>;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "it-ni-rep@test.local",
            "it-ni-other@test.local",
            "it-ni-admin@test.local"
          ]
        }
      }
    });

    const rep = await prisma.user.create({
      data: {
        email: "it-ni-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    repId = rep.id;

    const other = await prisma.user.create({
      data: {
        email: "it-ni-other@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    otherRepId = other.id;

    const admin = await prisma.user.create({
      data: {
        email: "it-ni-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });
    adminId = admin.id;

    const lead = await prisma.lead.create({
      data: {
        clientName: "Not Interested Test",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });
    leadId = lead.id;
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({
      where: { assignedToUserId: { in: [repId, otherRepId] } }
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { id: { in: [repId, otherRepId, adminId] } }
    });
    await prisma.$disconnect();
  });

  async function repCookie() {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-ni-rep@test.local", password: "RepPass123!" }
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
      payload: { email: "it-ni-admin@test.local", password: "AdminPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;
    await app.close();
    return cookie.value;
  }

  it("rep can delete own unconverted prospect", async () => {
    const temp = await prisma.lead.create({
      data: {
        clientName: "Delete Me Test",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });

    const app = await buildApp({ config });
    const cookie = await repCookie();
    const del = await inject(app, {
      method: "DELETE",
      url: `/api/leads/${temp.id}`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    expect(del.statusCode).toBe(200);
    const body = del.json() as { deleted: boolean; id: string };
    expect(body.deleted).toBe(true);
    expect(body.id).toBe(temp.id);

    const gone = await prisma.lead.findUnique({ where: { id: temp.id } });
    expect(gone).toBeNull();
    await app.close();
  });

  it("rep marks prospect not interested and list filters apply", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    const mark = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/not-interested`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { note: "No budget" }
    });
    expect(mark.statusCode).toBe(200);

    const active = await inject(app, {
      method: "GET",
      url: "/api/leads?view=leads&page=1&pageSize=50",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const activeBody = active.json() as { items: { id: string }[] };
    expect(activeBody.items.some((i) => i.id === leadId)).toBe(false);

    const defaultList = await inject(app, {
      method: "GET",
      url: "/api/leads?page=1&pageSize=50",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const defaultBody = defaultList.json() as { items: { id: string }[] };
    expect(defaultBody.items.some((i) => i.id === leadId)).toBe(false);

    const archived = await inject(app, {
      method: "GET",
      url: "/api/leads?view=not_interested&page=1&pageSize=50",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const archivedBody = archived.json() as {
      items: { id: string; prospectCategory: string }[];
    };
    expect(archivedBody.items.some((i) => i.id === leadId)).toBe(true);
    expect(archivedBody.items.find((i) => i.id === leadId)?.prospectCategory).toBe(
      "NOT_INTERESTED"
    );

    const events = await inject(app, {
      method: "GET",
      url: `/api/leads/${leadId}/prospect-category-events?page=1&pageSize=10`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const eventsBody = events.json() as {
      items: { category: string; note: string | null }[];
    };
    expect(eventsBody.items[0]?.note).toBe("No budget");

    await app.close();
  });

  it("rep can delete not-interested prospect", async () => {
    const archived = await prisma.lead.create({
      data: {
        clientName: "Delete Not Interested",
        status: LeadStatus.NEW,
        prospectCategory: ProspectCategory.NOT_INTERESTED,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });

    const app = await buildApp({ config });
    const cookie = await repCookie();
    const del = await inject(app, {
      method: "DELETE",
      url: `/api/leads/${archived.id}`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    expect(del.statusCode).toBe(200);

    const gone = await prisma.lead.findUnique({ where: { id: archived.id } });
    expect(gone).toBeNull();
    await app.close();
  });

  it("rep can restore not interested prospect", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    const restore = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/restore-interest`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    expect(restore.statusCode).toBe(200);

    const active = await inject(app, {
      method: "GET",
      url: "/api/leads?view=leads&page=1&pageSize=50",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    const activeBody = active.json() as { items: { id: string }[] };
    expect(activeBody.items.some((i) => i.id === leadId)).toBe(true);

    await app.close();
  });

  it("admin timeline includes not interested lead after mark", async () => {
    const app = await buildApp({ config });
    const repCk = await repCookie();
    const adminCk = await adminCookie();

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/not-interested`,
      headers: { cookie: `${config.cookieName}=${repCk}` },
      payload: {}
    });

    const timeline = await inject(app, {
      method: "GET",
      url: `/api/team/reps/${repId}/leads?page=1&pageSize=50`,
      headers: { cookie: `${config.cookieName}=${adminCk}` }
    });
    expect(timeline.statusCode).toBe(200);
    const body = timeline.json() as {
      items: { id: string; disposition: string }[];
    };
    const row = body.items.find((i) => i.id === leadId);
    expect(row?.disposition).toBe("not_interested");

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/restore-interest`,
      headers: { cookie: `${config.cookieName}=${repCk}` }
    });
    await app.close();
  });

  it("returns ALREADY_NOT_INTERESTED when marking twice", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/not-interested`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: {}
    });

    const again = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/not-interested`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: {}
    });
    expect(again.statusCode).toBe(409);
    const body = again.json() as { error: { code: string } };
    expect(body.error.code).toBe("SAME_PROSPECT_CATEGORY");

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/restore-interest`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    await app.close();
  });

  it("blocks patch on not interested prospect", async () => {
    const app = await buildApp({ config });
    const cookie = await repCookie();

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/not-interested`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: {}
    });

    const patch = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${leadId}`,
      headers: { cookie: `${config.cookieName}=${cookie}` },
      payload: { clientName: "Should Fail" }
    });
    expect(patch.statusCode).toBe(400);
    const body = patch.json() as { error: { code: string } };
    expect(body.error.code).toBe("LEAD_NOT_INTERESTED");

    await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/restore-interest`,
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    await app.close();
  });

  it("other rep cannot mark foreign prospect", async () => {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-ni-other@test.local", password: "RepPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;

    const mark = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/not-interested`,
      headers: { cookie: `${config.cookieName}=${cookie.value}` }
    });
    expect(mark.statusCode).toBe(404);
    await app.close();
  });
});
