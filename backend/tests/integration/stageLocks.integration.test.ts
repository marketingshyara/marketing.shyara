import bcrypt from "bcryptjs";
import { LeadStatus, PaymentKind, PaymentVerificationStatus, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: stage locks", () => {
  let repId: string;
  let adminId: string;
  let leadId: string;
  let config: ReturnType<typeof loadConfig>;
  let repCookie: string;

  beforeAll(async () => {
    config = loadConfig();
    await prisma.user.deleteMany({
      where: { email: { in: ["it-lock-rep@test.local", "it-lock-admin@test.local"] } }
    });

    const rep = await prisma.user.create({
      data: {
        email: "it-lock-rep@test.local",
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP
      }
    });
    repId = rep.id;

    const admin = await prisma.user.create({
      data: {
        email: "it-lock-admin@test.local",
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN
      }
    });
    adminId = admin.id;

    const lead = await prisma.lead.create({
      data: {
        clientName: "Lock Test",
        status: LeadStatus.ADVANCE_PAID,
        createdByUserId: repId,
        assignedToUserId: repId,
        convertedAt: new Date(),
        clientDetailsVerifiedAt: new Date(),
        whatsappGroupLink: "https://chat.whatsapp.com/abc",
        whatsappVerifiedAt: new Date()
      }
    });
    leadId = lead.id;

    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-lock-rep@test.local", password: "RepPass123!" }
    });
    repCookie = `${config.cookieName}=${login.cookies.find((c) => c.name === config.cookieName)!.value}`;
    await app.close();
  });

  afterAll(async () => {
    await prisma.leadPayment.deleteMany({ where: { leadId } }).catch(() => {});
    await prisma.lead.deleteMany({ where: { id: leadId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [repId, adminId] } } });
    await prisma.$disconnect();
  });

  it("rep PATCH whatsapp after verify returns 403 STAGE_LOCKED", async () => {
    const app = await buildApp({ config });
    const res = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${leadId}`,
      headers: { cookie: repCookie },
      payload: { whatsappGroupLink: "https://chat.whatsapp.com/new" }
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().code).toBe("STAGE_LOCKED");
    await app.close();
  });

  it("post-convert client PATCH sets pending client details review", async () => {
    const app = await buildApp({ config });
    const res = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${leadId}`,
      headers: { cookie: repCookie },
      payload: { clientPhone: "9123456789" }
    });
    expect(res.statusCode).toBe(200);
    const row = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
    expect(row.clientPhone).toBe("9123456789");
    expect(row.clientDetailsSubmittedAt).not.toBeNull();
    expect(row.clientDetailsVerifiedAt).toBeNull();
    await app.close();
  });

  it("admin verify client_details sets clientDetailsVerifiedAt", async () => {
    const app = await buildApp({ config });
    const adminLogin = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-lock-admin@test.local", password: "AdminPass123!" }
    });
    const adminCookie = `${config.cookieName}=${adminLogin.cookies.find((c) => c.name === config.cookieName)!.value}`;

    const verify = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/stages/client_details/verify`,
      headers: { cookie: adminCookie }
    });
    expect(verify.statusCode).toBe(200);
    const row = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
    expect(row.clientDetailsVerifiedAt).not.toBeNull();
    await app.close();
  });

  it("admin decline whatsapp clears verify so rep can PATCH again", async () => {
    const app = await buildApp({ config });
    const adminLogin = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "it-lock-admin@test.local", password: "AdminPass123!" }
    });
    const adminCookie = `${config.cookieName}=${adminLogin.cookies.find((c) => c.name === config.cookieName)!.value}`;

    const decline = await inject(app, {
      method: "POST",
      url: `/api/leads/${leadId}/stages/whatsapp/reject`,
      headers: { cookie: adminCookie },
      payload: {}
    });
    expect(decline.statusCode).toBe(200);

    const patch = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${leadId}`,
      headers: { cookie: repCookie },
      payload: { whatsappGroupLink: "https://chat.whatsapp.com/reopened" }
    });
    expect(patch.statusCode).toBe(200);
    const row = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });
    expect(row.whatsappGroupLink).toBe("https://chat.whatsapp.com/reopened");
    expect(row.whatsappVerifiedAt).toBeNull();
    await app.close();
  });

  it("rep can PATCH websiteTemplateId after convert until WhatsApp is verified", async () => {
    const templates = await prisma.websiteTemplate.findMany({
      take: 2,
      orderBy: { sortOrder: "asc" }
    });
    if (templates.length < 2) return;

    const templateLead = await prisma.lead.create({
      data: {
        clientName: "Template Patch Test",
        status: LeadStatus.ADVANCE_PAID,
        createdByUserId: repId,
        assignedToUserId: repId,
        convertedAt: new Date(),
        clientDetailsVerifiedAt: new Date(),
        websiteTemplateId: templates[0]!.id,
        agreedTotalCents: 799_900,
        advanceAmountCents: 399_950,
        finalQuoteCents: 399_950
      }
    });

    const app = await buildApp({ config });
    const patch = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${templateLead.id}`,
      headers: { cookie: repCookie },
      payload: { websiteTemplateId: templates[1]!.id }
    });
    expect(patch.statusCode).toBe(200);
    expect(patch.json().lead.websiteTemplateId).toBe(templates[1]!.id);

    await prisma.lead.update({
      where: { id: templateLead.id },
      data: { whatsappVerifiedAt: new Date() }
    });

    const blocked = await inject(app, {
      method: "PATCH",
      url: `/api/leads/${templateLead.id}`,
      headers: { cookie: repCookie },
      payload: { websiteTemplateId: templates[0]!.id }
    });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json().code).toBe("STAGE_LOCKED");

    await prisma.lead.delete({ where: { id: templateLead.id } });
    await app.close();
  });
});
