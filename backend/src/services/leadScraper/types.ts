export type ScraperPlaceResult = {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  businessStatus: string;
  category: string;
  hasWebsite: boolean;
  websiteUrl: string | null;
  mapsUrl: string;
  lat?: number;
  lng?: number;
};

export type ScraperSearchResponse = {
  source: "api" | "cache" | "api_sweep" | "cache_sweep";
  location: string;
  keyword: string;
  rawResultCount: number;
  totalResults: number;
  duplicateCount?: number;
  noWebsiteCount: number;
  searchedAt?: string;
  ageInDays?: number;
  /** True when a multi-category sweep stopped early due to quota */
  sweepPartial?: boolean;
  categoriesCompleted?: number;
  totalCategories?: number;
  results: ScraperPlaceResult[];
};

export const DEFAULT_SCRAPER_CATEGORIES = [
  "restaurant",
  "salon",
  "gym",
  "clinic",
  "shop",
  "coaching center",
  "boutique",
  "electronics store",
  "real estate agency",
  "automobile repair"
] as const;

export const ALLOWED_SCRAPER_RADII_KM = [1, 2, 3, 5, 10, 15] as const;

export function resolveScraperRadiusKm(radiusKm: unknown): number {
  const n = Number(radiusKm);
  return (ALLOWED_SCRAPER_RADII_KM as readonly number[]).includes(n) ? n : 2;
}

export function scraperCacheLocationKey(location: string, radiusKm: number): string {
  return `${location.trim()}|${radiusKm}km`;
}
