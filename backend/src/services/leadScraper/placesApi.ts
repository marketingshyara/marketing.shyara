import type { LeadScraperConfig } from "../../config.js";
import type { ScraperPlaceResult } from "./types.js";

const PLACES_BASE = "https://places.googleapis.com/v1/places";
const GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode/json";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 1,
  backoffMs = 2000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res;
      if (attempt < retries) {
        await sleep(backoffMs);
      } else {
        return res;
      }
    } catch {
      if (attempt < retries) {
        await sleep(backoffMs);
      } else {
        throw new Error("Network error calling Google Places API");
      }
    }
  }
  throw new Error("Network error calling Google Places API");
}

function assertApiKey(config: LeadScraperConfig): string {
  const apiKey = config.googlePlacesApiKey;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured. See .env.example");
  }
  return apiKey;
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractCategory(types: string[] | undefined): string {
  if (!types || types.length === 0) return "Business";
  const skip = new Set([
    "point_of_interest",
    "establishment",
    "premise",
    "street_address",
    "route",
    "political",
    "locality",
    "sublocality",
    "neighborhood"
  ]);
  const category = types.find((t) => !skip.has(t)) ?? types[0];
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type RawPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  types?: string[];
  location?: { latitude?: number; longitude?: number };
  websiteUri?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  googleMapsUri?: string;
  businessStatus?: string;
};

function mapPlace(p: RawPlace): ScraperPlaceResult {
  const placeId = p.id ?? "";
  return {
    placeId,
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    phone: p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? "",
    businessStatus: p.businessStatus ?? "UNKNOWN",
    category: extractCategory(p.types),
    hasWebsite: !!p.websiteUri,
    websiteUrl: p.websiteUri ?? null,
    mapsUrl: p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    lat: p.location?.latitude,
    lng: p.location?.longitude
  };
}

export async function geocodeLocation(
  config: LeadScraperConfig,
  query: string
): Promise<{ lat: number; lng: number; formattedAddress: string }> {
  const apiKey = assertApiKey(config);
  const url = `${GEOCODE_BASE}?address=${encodeURIComponent(query)}&key=${apiKey}`;
  const res = await fetchWithRetry(url);
  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    results?: { geometry: { location: { lat: number; lng: number } }; formatted_address: string }[];
  };

  if (data.status === "REQUEST_DENIED") {
    throw new Error(`Geocoding API denied: ${data.error_message ?? "Check API key permissions"}`);
  }
  if (data.status === "ZERO_RESULTS" || !data.results?.length) {
    throw new Error(`Could not geocode "${query}". Try a more specific location.`);
  }

  const result = data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address
  };
}

async function textSearch(
  config: LeadScraperConfig,
  lat: number,
  lng: number,
  radiusKm: number,
  keyword: string | null,
  maxResults: number
): Promise<ScraperPlaceResult[]> {
  const apiKey = assertApiKey(config);
  const cap = Math.min(maxResults, maxResults);
  const searchQuery = keyword && keyword !== "business" ? keyword : "businesses";

  const body = {
    textQuery: searchQuery,
    maxResultCount: Math.min(cap, 20),
    rankPreference: "RELEVANCE",
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusKm * 1000
      }
    }
  };

  const res = await fetchWithRetry(`${PLACES_BASE}:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.types,places.location,places.websiteUri,places.internationalPhoneNumber,places.nationalPhoneNumber,places.googleMapsUri,places.businessStatus"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`Text Search failed (${res.status}): ${err.error?.message ?? res.statusText}`);
  }

  const data = (await res.json()) as { places?: RawPlace[] };
  return (data.places ?? []).map(mapPlace);
}

function filterOperationalWithPhone(
  results: ScraperPlaceResult[],
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  maxResults: number
): ScraperPlaceResult[] {
  let filtered = results.filter((r) => {
    if (r.lat == null || r.lng == null) return false;
    const distance = getDistanceKm(centerLat, centerLng, r.lat, r.lng);
    if (distance > radiusKm) return false;
    return r.businessStatus === "OPERATIONAL" && r.phone.trim() !== "";
  });
  if (filtered.length > maxResults) {
    filtered = filtered.slice(0, maxResults);
  }
  return filtered;
}

export async function searchPlaces(
  config: LeadScraperConfig,
  location: string,
  keyword: string,
  radiusKm = 2
): Promise<{
  location: string;
  lat: number;
  lng: number;
  rawResultCount: number;
  totalResults: number;
  noWebsiteCount: number;
  results: ScraperPlaceResult[];
}> {
  const geo = await geocodeLocation(config, location);
  const rawResults = await textSearch(
    config,
    geo.lat,
    geo.lng,
    radiusKm,
    keyword,
    config.maxResultsSingle
  );
  const results = filterOperationalWithPhone(
    rawResults,
    geo.lat,
    geo.lng,
    radiusKm,
    config.maxResultsSingle
  );

  return {
    location: geo.formattedAddress,
    lat: geo.lat,
    lng: geo.lng,
    rawResultCount: rawResults.length,
    totalResults: results.length,
    noWebsiteCount: results.filter((r) => !r.hasWebsite).length,
    results
  };
}

export async function searchSingleCategory(
  config: LeadScraperConfig,
  category: string,
  lat: number,
  lng: number,
  radiusKm: number
): Promise<ScraperPlaceResult[]> {
  const rawResults = await textSearch(
    config,
    lat,
    lng,
    radiusKm,
    category,
    config.maxResultsSweep
  );
  return filterOperationalWithPhone(
    rawResults,
    lat,
    lng,
    radiusKm,
    config.maxResultsSweep
  );
}
