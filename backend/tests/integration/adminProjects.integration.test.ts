import bcrypt from "bcryptjs";
import { LeadStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: admin projects list", () => {
  let adminId: string;
  let repId: string;
  let leadId: string;
  let prospectId: string;
  let config: ReturnType<typeof loadConfig>;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: {
        email: { in: ["it-admproj-admin@test.local", "it-admproj-rep@test.local"] }
      }
    });

    const admin = await prisma.user.create({
      data: {
        email: "it-admproj-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: "it-admproj-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    repId = rep.id;

    const converted = await prisma.lead.create({
      data: {
        clientName: "Converted Client",
        status: LeadStatus.BUILDING,
        createdByUserId: repId,
        assignedToUserId: repId,
        convertedAt: new Date(),
        agreedTotalCents: 50_000_00
      }
    });
    leadId = converted.id;

    const prospect = await prisma.lead.create({
      data: {
        clientName: "Prospect Only",
        status: LeadStatus.NEW,
        createdByUserId: repId,
        assignedToUserId: repId
      }
    });
    prospectId = prospect.id;
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({ where: { id: { in: [leadId, prospectId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId] } } });
    await prisma.$disconnect();
  });

  it("lists only converted clients for admin", async () => {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-admproj-admin@test.local", password: "AdminPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName)!;

    const res = await inject(app, {
      method: "GET",
      url: "/api/admin/projects?page=1&pageSize=50",
      headers: { cookie: `${config.cookieName}=${cookie.value}` }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      items: { id: string; clientName: string; rep: { id: string } | null }[];
    };
    expect(body.items.some((i) => i.id === leadId)).toBe(true);
    expect(body.items.some((i) => i.id === prospectId)).toBe(false);
    const row = body.items.find((i) => i.id === leadId)!;
    expect(row.clientName).toBe("Converted Client");
    expect(row.rep?.id).toBe(repId);

    await app.close();
  });
});
