import { Prisma, type PrismaClient } from "@prisma/client";
import type { ScraperPlaceResult } from "./types.js";

export type PlaceClaimResult = "claimed" | "already_mine" | "taken_by_other" | "in_pipeline";

export async function upsertScraperPlace(
  prisma: PrismaClient,
  lead: ScraperPlaceResult,
  sourceSearchCacheId: string | null
): Promise<void> {
  await prisma.leadScraperPlace.upsert({
    where: { placeId: lead.placeId },
    create: {
      placeId: lead.placeId,
      name: lead.name,
      address: lead.address,
      phone: lead.phone,
      category: lead.category,
      hasWebsite: lead.hasWebsite,
      websiteUrl: lead.websiteUrl,
      mapsUrl: lead.mapsUrl,
      lat: lead.lat ?? null,
      lng: lead.lng ?? null,
      sourceSearchCacheId
    },
    update: {
      name: lead.name,
      address: lead.address,
      phone: lead.phone,
      category: lead.category,
      hasWebsite: lead.hasWebsite,
      websiteUrl: lead.websiteUrl,
      mapsUrl: lead.mapsUrl,
      lat: lead.lat ?? null,
      lng: lead.lng ?? null,
      sourceSearchCacheId: sourceSearchCacheId ?? undefined
    }
  });
}

export async function isPlaceInPipeline(
  prisma: PrismaClient,
  placeId: string
): Promise<boolean> {
  const row = await prisma.lead.findUnique({
    where: { googlePlaceId: placeId },
    select: { id: true }
  });
  return !!row;
}

export async function getPlaceClaimUserId(
  prisma: PrismaClient,
  placeId: string
): Promise<string | null> {
  const row = await prisma.leadScraperPlaceView.findUnique({
    where: { placeId },
    select: { userId: true }
  });
  return row?.userId ?? null;
}

export async function hasUserSeenPlace(
  prisma: PrismaClient,
  userId: string,
  placeId: string
): Promise<boolean> {
  const ownerId = await getPlaceClaimUserId(prisma, placeId);
  return ownerId === userId;
}

/** First rep to claim a place owns it org-wide; pipeline imports block all reps. */
export async function tryClaimPlaceForUser(
  prisma: PrismaClient,
  userId: string,
  placeId: string
): Promise<PlaceClaimResult> {
  if (await isPlaceInPipeline(prisma, placeId)) {
    return "in_pipeline";
  }

  const existing = await prisma.leadScraperPlaceView.findUnique({
    where: { placeId },
    select: { userId: true }
  });
  if (existing) {
    return existing.userId === userId ? "already_mine" : "taken_by_other";
  }

  try {
    await prisma.leadScraperPlaceView.create({
      data: { userId, placeId }
    });
    return "claimed";
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const ownerId = await getPlaceClaimUserId(prisma, placeId);
      if (ownerId === userId) return "already_mine";
      return "taken_by_other";
    }
    throw err;
  }
}

export async function persistSearchResultsForUser(
  prisma: PrismaClient,
  userId: string,
  leads: ScraperPlaceResult[],
  sourceSearchCacheId: string | null
): Promise<{
  newLeads: ScraperPlaceResult[];
  duplicateCount: number;
  orgUnavailableCount: number;
}> {
  const newLeads: ScraperPlaceResult[] = [];
  let duplicateCount = 0;
  let orgUnavailableCount = 0;

  for (const lead of leads) {
    await upsertScraperPlace(prisma, lead, sourceSearchCacheId);
    const claim = await tryClaimPlaceForUser(prisma, userId, lead.placeId);
    if (claim === "claimed") {
      newLeads.push(lead);
    } else if (claim === "already_mine") {
      duplicateCount++;
    } else {
      orgUnavailableCount++;
    }
  }

  return { newLeads, duplicateCount, orgUnavailableCount };
}

export type PastPlacesQuery = {
  userId: string;
  noWebsiteOnly?: boolean;
  search?: string;
  page: number;
  limit: number;
};

export async function listPastPlacesForUser(
  prisma: PrismaClient,
  query: PastPlacesQuery
): Promise<{
  leads: Array<{
    placeId: string;
    name: string;
    address: string | null;
    phone: string | null;
    category: string | null;
    hasWebsite: boolean;
    websiteUrl: string | null;
    mapsUrl: string | null;
    lat: number | null;
    lng: number | null;
    viewedAt: Date;
    pipelineImported: boolean;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { userId, noWebsiteOnly, search, page, limit } = query;
  const offset = (page - 1) * limit;
  const searchTerm = search?.trim();

  const views = await prisma.leadScraperPlaceView.findMany({
    where: {
      userId,
      place: {
        ...(noWebsiteOnly ? { hasWebsite: false } : {}),
        ...(searchTerm
          ? {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { address: { contains: searchTerm, mode: "insensitive" } },
                { category: { contains: searchTerm, mode: "insensitive" } }
              ]
            }
          : {})
      }
    },
    include: { place: true },
    orderBy: { viewedAt: "desc" },
    skip: offset,
    take: limit
  });

  const total = await prisma.leadScraperPlaceView.count({
    where: {
      userId,
      place: {
        ...(noWebsiteOnly ? { hasWebsite: false } : {}),
        ...(searchTerm
          ? {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { address: { contains: searchTerm, mode: "insensitive" } },
                { category: { contains: searchTerm, mode: "insensitive" } }
              ]
            }
          : {})
      }
    }
  });

  const placeIds = views.map((v) => v.placeId);
  const imported = placeIds.length
    ? await prisma.lead.findMany({
        where: { googlePlaceId: { in: placeIds } },
        select: { googlePlaceId: true }
      })
    : [];
  const importedSet = new Set(imported.map((l) => l.googlePlaceId));

  return {
    leads: views.map((v) => ({
      placeId: v.place.placeId,
      name: v.place.name,
      address: v.place.address,
      phone: v.place.phone,
      category: v.place.category,
      hasWebsite: v.place.hasWebsite,
      websiteUrl: v.place.websiteUrl,
      mapsUrl: v.place.mapsUrl,
      lat: v.place.lat,
      lng: v.place.lng,
      viewedAt: v.viewedAt,
      pipelineImported: importedSet.has(v.place.placeId)
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export function csvEscape(val: string | null | undefined): string {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type ClearScraperPastResult = {
  viewsDeleted: number;
  searchCacheDeleted: number;
  placesDeleted: number;
  pipelinePlaceIdsPreserved: number;
};

/** Remove scraper past results and search cache; keep pipeline leads and their place rows. */
export async function clearUnimportedScraperPastResults(
  prisma: PrismaClient
): Promise<ClearScraperPastResult> {
  const pipelineRows = await prisma.lead.findMany({
    where: { googlePlaceId: { not: null } },
    select: { googlePlaceId: true }
  });
  const pipelinePlaceIds = [
    ...new Set(
      pipelineRows
        .map((r) => r.googlePlaceId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  ];

  const notInPipeline =
    pipelinePlaceIds.length > 0 ? { placeId: { notIn: pipelinePlaceIds } } : {};

  return prisma.$transaction(async (tx) => {
    const viewsDeleted = await tx.leadScraperPlaceView.deleteMany({
      where: notInPipeline
    });
    const searchCacheDeleted = await tx.leadScraperSearchCache.deleteMany();
    const placesDeleted = await tx.leadScraperPlace.deleteMany({
      where: notInPipeline
    });

    return {
      viewsDeleted: viewsDeleted.count,
      searchCacheDeleted: searchCacheDeleted.count,
      placesDeleted: placesDeleted.count,
      pipelinePlaceIdsPreserved: pipelinePlaceIds.length
    };
  });
}

export async function exportPastPlacesCsv(
  prisma: PrismaClient,
  userId: string,
  noWebsiteOnly: boolean
): Promise<string> {
  const result = await listPastPlacesForUser(prisma, {
    userId,
    noWebsiteOnly,
    page: 1,
    limit: 10_000
  });

  const headers = [
    "Name",
    "Category",
    "Address",
    "Phone",
    "Has Website",
    "Website",
    "Google Maps",
    "Viewed"
  ];
  const lines = [headers.join(",")];

  for (const row of result.leads) {
    lines.push(
      [
        csvEscape(row.name),
        csvEscape(row.category),
        csvEscape(row.address),
        csvEscape(row.phone),
        row.hasWebsite ? "Yes" : "No",
        csvEscape(row.websiteUrl),
        csvEscape(row.mapsUrl),
        row.viewedAt.toISOString()
      ].join(",")
    );
  }

  return lines.join("\n");
}
