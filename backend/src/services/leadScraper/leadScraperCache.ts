import type { PrismaClient } from "@prisma/client";
import type { LeadScraperConfig } from "../../config.js";
import type { ScraperPlaceResult } from "./types.js";

export function normalizeCacheKey(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

export type CachedSearchResult = {
  cached: true;
  searchId: string;
  data: ScraperPlaceResult[];
  searchedAt: Date;
  ageInDays: number;
  resultCount: number;
  noWebsiteCount: number;
};

export type CacheMiss = { cached: false };

export async function getCachedSearch(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  locationKey: string,
  keyword: string
): Promise<CachedSearchResult | CacheMiss> {
  const locKey = normalizeCacheKey(locationKey);
  const kw = normalizeCacheKey(keyword || "business");
  const ttlMs = config.cacheTtlDays * 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - ttlMs);

  const row = await prisma.leadScraperSearchCache.findFirst({
    where: {
      locationKey: locKey,
      keyword: kw,
      searchedAt: { gt: cutoff }
    },
    orderBy: { searchedAt: "desc" }
  });

  if (!row) return { cached: false };

  const ageMs = Date.now() - row.searchedAt.getTime();
  const ageInDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

  return {
    cached: true,
    searchId: row.id,
    data: row.resultsJson as ScraperPlaceResult[],
    searchedAt: row.searchedAt,
    ageInDays,
    resultCount: row.resultCount,
    noWebsiteCount: row.noWebsiteCount
  };
}

export async function saveToCache(
  prisma: PrismaClient,
  locationKey: string,
  keyword: string,
  results: ScraperPlaceResult[],
  lat: number | null,
  lng: number | null,
  userId: string | null
): Promise<string> {
  const locKey = normalizeCacheKey(locationKey);
  const kw = normalizeCacheKey(keyword || "business");
  const noWebsiteCount = results.filter((r) => !r.hasWebsite).length;

  const row = await prisma.leadScraperSearchCache.upsert({
    where: { locationKey_keyword: { locationKey: locKey, keyword: kw } },
    create: {
      locationKey: locKey,
      keyword: kw,
      resultsJson: results,
      resultCount: results.length,
      noWebsiteCount,
      lat,
      lng,
      searchedByUserId: userId
    },
    update: {
      resultsJson: results,
      resultCount: results.length,
      noWebsiteCount,
      lat,
      lng,
      searchedByUserId: userId,
      searchedAt: new Date()
    },
    select: { id: true }
  });
  return row.id;
}

export async function checkCacheStatus(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  locationKey: string,
  keyword: string | null
): Promise<{
  isCached: boolean;
  searchedAt?: string;
  ageInDays?: number;
  resultCount?: number;
  noWebsiteCount?: number;
}> {
  const cached = await getCachedSearch(prisma, config, locationKey, keyword ?? "business");
  if (!cached.cached) return { isCached: false };

  return {
    isCached: true,
    searchedAt: cached.searchedAt.toISOString(),
    ageInDays: cached.ageInDays,
    resultCount: cached.resultCount,
    noWebsiteCount: cached.noWebsiteCount
  };
}
