import bcrypt from "bcryptjs";
import { LeadStatus, ProspectCategory, UserRole } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { prisma } from "../../src/lib/prisma.js";
import { inject } from "../helpers/inject.js";
import { ensureUserQuotaRow, reserveSearchQuota } from "../../src/services/leadScraper/leadScraperQuota.js";
import { importScraperPlacesToPipeline } from "../../src/services/leadScraper/leadScraperImportService.js";
import {
  persistSearchResultsForUser,
  tryClaimPlaceForUser
} from "../../src/services/leadScraper/leadScraperPlacesStore.js";
import type { ScraperPlaceResult } from "../../src/services/leadScraper/types.js";

const run = Boolean(process.env.DATABASE_URL && process.env.SESSION_SECRET);
const d = run ? describe : describe.skip;

d("integration: lead scraper", () => {
  let adminId: string;
  let repId: string;
  let otherRepId: string;
  const repEmail = "it-scraper-rep@test.local";
  const otherRepEmail = "it-scraper-other@test.local";
  const adminEmail = "it-scraper-admin@test.local";
  const testPlaceId = "places/ChIJ_scraper_test_place";
  const exclusivePlaceId = "places/ChIJ_scraper_exclusive_place";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, repEmail, otherRepEmail] } }
    });
    await prisma.lead.deleteMany({
      where: { googlePlaceId: { in: [testPlaceId, exclusivePlaceId] } }
    });
    await prisma.leadScraperPlaceView.deleteMany({
      where: { placeId: { in: [testPlaceId, exclusivePlaceId] } }
    });
    await prisma.leadScraperPlace.deleteMany({
      where: { placeId: { in: [testPlaceId, exclusivePlaceId] } }
    });

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("AdminPass123!", 10),
        role: UserRole.ADMIN,
        displayName: "Scraper IT Admin"
      }
    });
    adminId = admin.id;

    const rep = await prisma.user.create({
      data: {
        email: repEmail,
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Scraper IT Rep"
      }
    });
    repId = rep.id;

    const otherRep = await prisma.user.create({
      data: {
        email: otherRepEmail,
        passwordHash: await bcrypt.hash("RepPass123!", 10),
        role: UserRole.SALES_REP,
        displayName: "Scraper IT Other Rep"
      }
    });
    otherRepId = otherRep.id;

    await prisma.leadScraperPlace.create({
      data: {
        placeId: testPlaceId,
        name: "Test Cafe",
        address: "Test Street",
        phone: "+91 9876543210",
        category: "Restaurant",
        hasWebsite: false,
        mapsUrl: "https://maps.example.com"
      }
    });
    await prisma.leadScraperPlaceView.create({
      data: { userId: repId, placeId: testPlaceId }
    });
  });

  afterAll(async () => {
    await prisma.lead.deleteMany({
      where: { googlePlaceId: { in: [testPlaceId, exclusivePlaceId] } }
    });
    await prisma.leadScraperPlaceView.deleteMany({
      where: { placeId: { in: [testPlaceId, exclusivePlaceId] } }
    });
    await prisma.leadScraperPlace.deleteMany({
      where: { placeId: { in: [testPlaceId, exclusivePlaceId] } }
    });
    await prisma.leadScraperUserQuota.deleteMany({
      where: { userId: { in: [adminId, repId, otherRepId] } }
    });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, repId, otherRepId] } } });
    await prisma.$disconnect();
  });

  async function loginRep(config: ReturnType<typeof loadConfig>) {
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: repEmail, password: "RepPass123!" }
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    return { app, cookie: cookie!.value };
  }

  it("admin cannot access lead scraper usage", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName);
    const res = await inject(app, {
      method: "GET",
      url: "/api/lead-scraper/usage",
      headers: { cookie: `${config.cookieName}=${cookie!.value}` }
    });
    expect(res.statusCode).toBe(403);
    await app.close();
  });

  it("rep can read usage and gets default quota", async () => {
    const config = loadConfig();
    const { app, cookie } = await loginRep(config);
    const res = await inject(app, {
      method: "GET",
      url: "/api/lead-scraper/usage",
      headers: { cookie: `${config.cookieName}=${cookie}` }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.user.limit).toBe(config.leadScraper.repDefaultQuota);
    await app.close();
  });

  it("import creates NEW + NEW_LEAD lead with normalized phone", async () => {
    const config = loadConfig();
    const rep = await prisma.user.findUniqueOrThrow({ where: { id: repId } });
    const app = await buildApp({ config });

    const result = await importScraperPlacesToPipeline(
      prisma,
      rep,
      [testPlaceId],
      { headers: {}, ip: "127.0.0.1" } as never
    );

    expect(result.imported).toHaveLength(1);
    expect(result.imported[0]!.clientPhone).toBe("9876543210");
    expect(result.imported[0]!.prospectCategory).toBe(ProspectCategory.NEW_LEAD);
    expect(result.imported[0]!.status).toBe(LeadStatus.NEW);

    const lead = await prisma.lead.findUnique({
      where: { googlePlaceId: testPlaceId }
    });
    expect(lead?.assignedToUserId).toBe(repId);
    await app.close();
  });

  it("admin can grant scraper quota to rep", async () => {
    const config = loadConfig();
    const app = await buildApp({ config });
    const login = await inject(app, {
      method: "POST",
      url: "/api/auth/login",
      payload: { email: adminEmail, password: "AdminPass123!" }
    });
    const cookie = login.cookies.find((c) => c.name === config.cookieName);

    const res = await inject(app, {
      method: "PATCH",
      url: `/api/users/${repId}/scraper-quota`,
      headers: {
        cookie: `${config.cookieName}=${cookie!.value}`,
        "content-type": "application/json"
      },
      payload: { amount: 5 }
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.granted).toBe(5);
    expect(body.newLimit).toBeGreaterThanOrEqual(config.leadScraper.repDefaultQuota + 5);
    await app.close();
  });

  it("org-wide place claim blocks second rep from seeing the same place", async () => {
    const sample: ScraperPlaceResult = {
      placeId: exclusivePlaceId,
      name: "Exclusive Cafe",
      address: "Exclusive Street",
      phone: "+91 9876501234",
      businessStatus: "OPERATIONAL",
      category: "Restaurant",
      hasWebsite: false,
      websiteUrl: null,
      mapsUrl: "https://maps.example.com/exclusive"
    };

    const first = await persistSearchResultsForUser(prisma, repId, [sample], null);
    expect(first.newLeads).toHaveLength(1);

    const second = await persistSearchResultsForUser(prisma, otherRepId, [sample], null);
    expect(second.newLeads).toHaveLength(0);
    expect(second.orgUnavailableCount).toBe(1);

    const claim = await tryClaimPlaceForUser(prisma, otherRepId, exclusivePlaceId);
    expect(claim).toBe("taken_by_other");
  });

  it("second rep import skips place claimed by first rep", async () => {
    const otherRep = await prisma.user.findUniqueOrThrow({ where: { id: otherRepId } });
    const result = await importScraperPlacesToPipeline(
      prisma,
      otherRep,
      [exclusivePlaceId],
      { headers: {}, ip: "127.0.0.1" } as never
    );
    expect(result.imported).toHaveLength(0);
    expect(result.failed.some((f) => f.placeId === exclusivePlaceId)).toBe(true);
  });

  it("reserveSearchQuota updates user and global usage atomically", async () => {
    const config = loadConfig();
    await ensureUserQuotaRow(prisma, config.leadScraper, repId);
    const rep = await prisma.user.findUniqueOrThrow({ where: { id: repId } });
    const before = await prisma.leadScraperUserQuota.findUniqueOrThrow({
      where: { userId: repId }
    });
    await reserveSearchQuota(prisma, config.leadScraper, repId, {
      displayName: rep.displayName,
      email: rep.email,
      role: rep.role
    }, 1);
    const after = await prisma.leadScraperUserQuota.findUniqueOrThrow({
      where: { userId: repId }
    });
    expect(after.searchesUsed).toBe(before.searchesUsed + 1);
  });
});
