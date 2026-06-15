import type { PrismaClient } from "@prisma/client";
import type { LeadScraperConfig } from "../../config.js";
import { HttpError } from "../../errors/httpError.js";
import { checkCacheStatus, getCachedSearch, saveToCache } from "./leadScraperCache.js";
import {
  getUserUsage,
  releaseSearchQuota,
  reserveSearchQuota,
  throwQuotaExceeded
} from "./leadScraperQuota.js";
import { geocodeLocation, searchPlaces, searchSingleCategory } from "./placesApi.js";
import { persistSearchResultsForUser } from "./leadScraperPlacesStore.js";
import {
  DEFAULT_SCRAPER_CATEGORIES,
  scraperCacheLocationKey,
  type ScraperSearchResponse
} from "./types.js";

export type LeadScraperSearchInput = {
  location: string;
  keyword?: string | null;
  radiusKm: number;
};

export async function runLeadScraperSearch(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string,
  userDisplay: { displayName: string | null; email: string; role: string },
  input: LeadScraperSearchInput
): Promise<ScraperSearchResponse> {
  if (!config.googlePlacesApiKey) {
    throw new HttpError(
      503,
      "API_NOT_CONFIGURED",
      "GOOGLE_PLACES_API_KEY not configured. Contact your administrator."
    );
  }

  const loc = input.location.trim();
  const kw = input.keyword?.trim() || null;
  const radiusKm = input.radiusKm;
  const cacheKeyLoc = scraperCacheLocationKey(loc, radiusKm);

  if (!kw) {
    return multiCategorySearch(prisma, config, userId, userDisplay, loc, radiusKm);
  }

  const cached = await getCachedSearch(prisma, config, cacheKeyLoc, kw);
  if (cached.cached) {
    const { newLeads, duplicateCount, orgUnavailableCount } = await persistSearchResultsForUser(
      prisma,
      userId,
      cached.data,
      cached.searchId
    );

    return {
      source: "cache",
      searchedAt: cached.searchedAt.toISOString(),
      ageInDays: cached.ageInDays,
      location: loc,
      keyword: kw,
      rawResultCount: cached.data.length,
      totalResults: newLeads.length,
      duplicateCount,
      orgUnavailableCount,
      noWebsiteCount: newLeads.filter((r) => !r.hasWebsite).length,
      results: newLeads
    };
  }

  await reserveSearchQuota(prisma, config, userId, userDisplay, 1);

  let searchResult: Awaited<ReturnType<typeof searchPlaces>>;
  try {
    searchResult = await searchPlaces(config, loc, kw, radiusKm);
  } catch (err) {
    await releaseSearchQuota(prisma, userId, 1);
    throw err;
  }

  const searchId = await saveToCache(
    prisma,
    cacheKeyLoc,
    kw,
    searchResult.results,
    searchResult.lat,
    searchResult.lng,
    userId
  );

  const { newLeads, duplicateCount, orgUnavailableCount } = await persistSearchResultsForUser(
    prisma,
    userId,
    searchResult.results,
    searchId
  );

  return {
    source: "api",
    location: searchResult.location,
    keyword: kw,
    rawResultCount: searchResult.rawResultCount,
    totalResults: newLeads.length,
    duplicateCount,
    orgUnavailableCount,
    noWebsiteCount: newLeads.filter((r) => !r.hasWebsite).length,
    results: newLeads
  };
}

async function multiCategorySearch(
  prisma: PrismaClient,
  config: LeadScraperConfig,
  userId: string,
  userDisplay: { displayName: string | null; email: string; role: string },
  loc: string,
  radiusKm: number
): Promise<ScraperSearchResponse> {
  const geo = await geocodeLocation(config, loc);
  const cacheKeyLoc = scraperCacheLocationKey(loc, radiusKm);

  const allResults: {
    results: Awaited<ReturnType<typeof searchSingleCategory>>;
    searchId: string | null;
  }[] = [];
  let totalRawCount = 0;
  let freshCategoriesSearched = 0;
  let categoriesCompleted = 0;
  let sweepPartial = false;
  const totalCategories = DEFAULT_SCRAPER_CATEGORIES.length;

  for (const category of DEFAULT_SCRAPER_CATEGORIES) {
    const cached = await getCachedSearch(prisma, config, cacheKeyLoc, category);

    if (cached.cached) {
      allResults.push({ results: cached.data, searchId: cached.searchId });
      categoriesCompleted++;
    } else {
      try {
        await reserveSearchQuota(prisma, config, userId, userDisplay, 1);
      } catch (err) {
        if (
          err instanceof HttpError &&
          (err.code === "QUOTA_EXCEEDED" || err.code === "GLOBAL_QUOTA_EXCEEDED")
        ) {
          sweepPartial = true;
          break;
        }
        throw err;
      }

      let categoryResults: Awaited<ReturnType<typeof searchSingleCategory>>;
      try {
        categoryResults = await searchSingleCategory(
          config,
          category,
          geo.lat,
          geo.lng,
          radiusKm
        );
      } catch (err) {
        await releaseSearchQuota(prisma, userId, 1);
        throw err;
      }

      const searchId = await saveToCache(
        prisma,
        cacheKeyLoc,
        category,
        categoryResults,
        geo.lat,
        geo.lng,
        userId
      );
      allResults.push({ results: categoryResults, searchId });
      freshCategoriesSearched++;
      totalRawCount += categoryResults.length;
      categoriesCompleted++;
    }
  }

  if (allResults.length === 0) {
    const usage = await getUserUsage(prisma, config, userId, userDisplay);
    throwQuotaExceeded(usage, usage.global.remaining <= 0 ? "GLOBAL" : "USER");
  }

  const uniqueMap = new Map<
    string,
    { lead: (typeof allResults)[0]["results"][0]; searchId: string | null }
  >();
  for (const batch of allResults) {
    for (const r of batch.results) {
      if (!uniqueMap.has(r.placeId)) {
        uniqueMap.set(r.placeId, { lead: r, searchId: batch.searchId });
      }
    }
  }

  const newLeads: typeof allResults[0]["results"] = [];
  let duplicateCount = 0;
  let orgUnavailableCount = 0;

  for (const { lead, searchId } of uniqueMap.values()) {
    const {
      newLeads: batchNew,
      duplicateCount: batchDup,
      orgUnavailableCount: batchOrg
    } = await persistSearchResultsForUser(prisma, userId, [lead], searchId);
    newLeads.push(...batchNew);
    duplicateCount += batchDup;
    orgUnavailableCount += batchOrg;
  }

  return {
    source: freshCategoriesSearched > 0 ? "api_sweep" : "cache_sweep",
    location: geo.formattedAddress,
    keyword: "All Types (Sweep)",
    rawResultCount: totalRawCount || uniqueMap.size,
    totalResults: newLeads.length,
    duplicateCount,
    orgUnavailableCount,
    noWebsiteCount: newLeads.filter((r) => !r.hasWebsite).length,
    results: newLeads,
    sweepPartial: sweepPartial || undefined,
    categoriesCompleted,
    totalCategories
  };
}

export { checkCacheStatus };

