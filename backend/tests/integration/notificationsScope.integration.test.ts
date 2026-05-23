import bcrypt from "bcryptjs";
import {
  LeadStatus,
  PortalNotificationKind,
  UserRole
} from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: notification visibility", () => {
  let adminId: string;
  let repAId: string;
  let repBId: string;
  let leadAId: string;
  let leadBId: string;
  let config: ReturnType<typeof loadConfig>;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "it-notif-admin@test.local",
            "it-notif-rep-a@test.local",
            "it-notif-rep-b@test.local"
          ]
        }
      }
    });

    const admin = await prisma.user.create({
      data: {
        email: "it-notif-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Notif Admin"
      }
    });
    adminId = admin.id;

    const repA = await prisma.user.create({
      data: {
        email: "it-notif-rep-a@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Rep A"
      }
    });
    repAId = repA.id;

    const repB = await prisma.user.create({
      data: {
        email: "it-notif-rep-b@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Rep B"
      }
    });
    repBId = repB.id;

    const leadA = await prisma.lead.create({
      data: {
        clientName: "Client A",
        status: LeadStatus.NEW,
        createdByUserId: repAId,
        assignedToUserId: repAId
      }
    });
    leadAId = leadA.id;

    const leadB = await prisma.lead.create({
      data: {
        clientName: "Client B",
        status: LeadStatus.NEW,
        createdByUserId: repBId,
        assignedToUserId: repBId
      }
    });
    leadBId = leadB.id;

    await prisma.portalNotification.createMany({
      data: [
        {
          userId: repAId,
          leadId: leadAId,
          kind: PortalNotificationKind.ADMIN_VERIFIED,
          message: "A verified"
        },
        {
          userId: repBId,
          leadId: leadBId,
          kind: PortalNotificationKind.ADMIN_VERIFIED,
          message: "B verified"
        },
        {
          userId: repAId,
          leadId: leadBId,
          kind: PortalNotificationKind.REP_SUBMITTED,
          message: "mis-tagged rep submitted"
        },
        {
          userId: adminId,
          leadId: leadAId,
          kind: PortalNotificationKind.REP_SUBMITTED,
          message: "admin queue A"
        }
      ]
    });
  });

  afterAll(async () => {
    await prisma.portalNotification.deleteMany({
      where: { leadId: { in: [leadAId, leadBId] } }
    });
    await prisma.lead.deleteMany({ where: { id: { in: [leadAId, leadBId] } } });
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, repAId, repBId] } }
    });
    await prisma.$disconnect();
  });

  async function loginCookie(email: string, password: string) {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    expect(cookie).toBeDefined();
    await app.close();
    return cookie!.value;
  }

  it("rep A list excludes rep B notifications and REP_SUBMITTED", async () => {
    const cookie = await loginCookie("it-notif-rep-a@test.local", "RepPass123!");
    const app = await buildApp({ config });
    const res = await inject(app, {
      method: "GET",
      url: "/api/notifications?page=1&pageSize=20",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.total).toBe(1);
    expect(body.items[0].message).toBe("A verified");
    await app.close();
  });

  it("admin list shows only REP_SUBMITTED", async () => {
    const cookie = await loginCookie("it-notif-admin@test.local", "AdminPass123!");
    const app = await buildApp({ config });
    const res = await inject(app, {
      method: "GET",
      url: "/api/notifications?page=1&pageSize=20",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.total).toBe(1);
    expect(body.items[0].message).toBe("admin queue A");
    await app.close();
  });
});
