import {
  ActivityAction,
  LeadStatus,
  ProspectCategory,
  Prisma,
  type PrismaClient,
  type User
} from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { isValidIndianMobile, normalizeIndianMobileInput } from "../../lib/indianMobilePhone.js";
import { logActivity } from "../activityLog.js";
import { seedNewLeadProspectCategoryEvent } from "../leadProspectCategory.js";
import { hasUserSeenPlace } from "./leadScraperPlacesStore.js";

export type ImportPlaceResult = {
  placeId: string;
  reason: string;
};

export type ImportScraperPlacesResult = {
  imported: Array<{
    id: string;
    clientName: string;
    clientPhone: string | null;
    googlePlaceId: string | null;
    prospectCategory: ProspectCategory;
    status: LeadStatus;
  }>;
  skipped: ImportPlaceResult[];
  failed: ImportPlaceResult[];
};

function buildScraperNotes(place: {
  name: string;
  address: string | null;
  category: string | null;
  hasWebsite: boolean;
  websiteUrl: string | null;
  mapsUrl: string | null;
}): string {
  const lines = [
    "Imported from Lead Finder (Google Places).",
    place.category ? `Category: ${place.category}` : null,
    place.address ? `Address: ${place.address}` : null,
    place.hasWebsite
      ? place.websiteUrl
        ? `Website: ${place.websiteUrl}`
        : "Has website"
      : "No website",
    place.mapsUrl ? `Maps: ${place.mapsUrl}` : null
  ].filter(Boolean);
  return lines.join("\n");
}

export async function importScraperPlacesToPipeline(
  prisma: PrismaClient,
  user: User,
  placeIds: string[],
  request: FastifyRequest
): Promise<ImportScraperPlacesResult> {
  const uniqueIds = [...new Set(placeIds.filter(Boolean))];
  const imported: ImportScraperPlacesResult["imported"] = [];
  const skipped: ImportPlaceResult[] = [];
  const failed: ImportPlaceResult[] = [];

  for (const placeId of uniqueIds) {
    try {
      const result = await importSinglePlace(prisma, user, placeId, request);
      if (result.kind === "imported") {
        imported.push(result.lead);
      } else if (result.kind === "skipped") {
        skipped.push(result.detail);
      } else {
        failed.push(result.detail);
      }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        skipped.push({ placeId, reason: "Already in pipeline" });
        continue;
      }
      throw err;
    }
  }

  return { imported, skipped, failed };
}

async function importSinglePlace(
  prisma: PrismaClient,
  user: User,
  placeId: string,
  request: FastifyRequest
): Promise<
  | { kind: "imported"; lead: ImportScraperPlacesResult["imported"][0] }
  | { kind: "skipped"; detail: ImportPlaceResult }
  | { kind: "failed"; detail: ImportPlaceResult }
> {
  const place = await prisma.leadScraperPlace.findUnique({ where: { placeId } });
  if (!place) {
    return { kind: "failed", detail: { placeId, reason: "Place not found" } };
  }

  const seen = await hasUserSeenPlace(prisma, user.id, placeId);
  if (!seen) {
    return {
      kind: "failed",
      detail: { placeId, reason: "You have not discovered this place yet" }
    };
  }

  const rawPhone = place.phone?.trim() ?? "";
  if (!rawPhone) {
    return { kind: "failed", detail: { placeId, reason: "No phone number" } };
  }

  const normalized = normalizeIndianMobileInput(rawPhone);
  if (!isValidIndianMobile(normalized)) {
    return { kind: "failed", detail: { placeId, reason: "Invalid Indian mobile number" } };
  }

  const lead = await prisma.$transaction(async (tx) => {
    const existingByPlace = await tx.lead.findUnique({
      where: { googlePlaceId: placeId },
      select: { id: true }
    });
    if (existingByPlace) {
      return null;
    }

    const existingByPhone = await tx.lead.findFirst({
      where: { clientPhone: normalized },
      select: { id: true }
    });
    if (existingByPhone) {
      return { duplicatePhone: true as const };
    }

    const row = await tx.lead.create({
      data: {
        createdByUserId: user.id,
        assignedToUserId: user.id,
        clientName: place.name,
        clientPhone: normalized,
        notes: buildScraperNotes(place),
        status: LeadStatus.NEW,
        prospectCategory: ProspectCategory.NEW_LEAD,
        googlePlaceId: placeId,
        scraperImportedAt: new Date()
      }
    });
    await seedNewLeadProspectCategoryEvent(tx, row.id, user.id);
    return row;
  });

  if (!lead) {
    return { kind: "skipped", detail: { placeId, reason: "Already in pipeline" } };
  }
  if ("duplicatePhone" in lead) {
    return {
      kind: "skipped",
      detail: { placeId, reason: "Phone number already in pipeline" }
    };
  }

  await logActivity({
    prisma,
    userId: user.id,
    action: ActivityAction.CREATE,
    entityType: "Lead",
    entityId: lead.id,
    after: {
      status: lead.status,
      clientName: lead.clientName,
      googlePlaceId: lead.googlePlaceId,
      source: "lead_scraper"
    },
    request
  });

  return {
    kind: "imported",
    lead: {
      id: lead.id,
      clientName: lead.clientName,
      clientPhone: lead.clientPhone,
      googlePlaceId: lead.googlePlaceId,
      prospectCategory: lead.prospectCategory,
      status: lead.status
    }
  };
}
