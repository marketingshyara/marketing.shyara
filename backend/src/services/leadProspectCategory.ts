import {
  ActivityAction,
  PaymentVerificationStatus,
  ProspectCategory,
  type Lead,
  type Prisma,
  type User
} from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { HttpError } from "../errors/httpError.js";
import { logActivity } from "./activityLog.js";
import type { PrismaClient } from "@prisma/client";
import { assertLeadNotInterestedEligible } from "./leadGuards.js";
import type { SetProspectCategoryBody } from "../validators/schemas.js";

type LeadWithRelations = Lead & {
  payments: { verificationStatus: PaymentVerificationStatus }[];
  project: { id: string } | null;
};

export type SetLeadProspectCategoryInput = {
  prisma: PrismaClient;
  lead: LeadWithRelations;
  user: User;
  body: SetProspectCategoryBody;
  request: FastifyRequest;
};

function denormalizedFieldsForCategory(
  category: ProspectCategory,
  body: SetProspectCategoryBody
): Pick<Lead, "callbackScheduledAt" | "interestedSampleShared"> {
  if (category === ProspectCategory.CALLBACK_REQUESTED) {
    return {
      callbackScheduledAt: body.callbackAt ?? null,
      interestedSampleShared: null
    };
  }
  if (category === ProspectCategory.INTERESTED) {
    return {
      callbackScheduledAt: null,
      interestedSampleShared: body.sampleShared ?? null
    };
  }
  return {
    callbackScheduledAt: null,
    interestedSampleShared: null
  };
}

export function assertProspectCategoryChangeAllowed(
  lead: LeadWithRelations,
  body: SetProspectCategoryBody
): void {
  if (lead.convertedAt != null) {
    throw new HttpError(
      400,
      "LEAD_ALREADY_CONVERTED",
      "Converted clients cannot change prospect category."
    );
  }

  const sameCategory = lead.prospectCategory === body.category;
  if (
    sameCategory &&
    body.category === ProspectCategory.INTERESTED &&
    body.sampleShared !== undefined &&
    lead.interestedSampleShared === body.sampleShared
  ) {
    throw new HttpError(
      409,
      "SAME_PROSPECT_CATEGORY",
      "Website sample status is already set to this value."
    );
  }

  if (sameCategory && body.category !== ProspectCategory.INTERESTED) {
    throw new HttpError(
      409,
      "SAME_PROSPECT_CATEGORY",
      "This prospect is already in this category."
    );
  }

  if (body.category === ProspectCategory.NOT_INTERESTED) {
    assertLeadNotInterestedEligible(lead);
  }
}

export async function setLeadProspectCategory(
  input: SetLeadProspectCategoryInput
): Promise<Lead> {
  const { prisma, lead, user, body, request } = input;
  assertProspectCategoryChangeAllowed(lead, body);

  const note = body.note?.trim() ? body.note.trim() : null;
  const denorm = denormalizedFieldsForCategory(body.category, body);

  return prisma.$transaction(async (tx) => {
    const claim = await tx.lead.updateMany({
      where: {
        id: lead.id,
        convertedAt: null,
        updatedAt: lead.updatedAt
      },
      data: {
        prospectCategory: body.category,
        ...denorm
      }
    });
    if (claim.count === 0) {
      const current = await tx.lead.findUnique({ where: { id: lead.id } });
      if (current?.convertedAt != null) {
        throw new HttpError(
          400,
          "LEAD_ALREADY_CONVERTED",
          "Converted clients cannot change prospect category."
        );
      }
      throw new HttpError(409, "CONCURRENT_MODIFICATION", "Lead was modified concurrently.");
    }

    await tx.leadProspectCategoryEvent.create({
      data: {
        leadId: lead.id,
        category: body.category,
        note,
        callbackAt:
          body.category === ProspectCategory.CALLBACK_REQUESTED
            ? (body.callbackAt ?? null)
            : null,
        sampleShared:
          body.category === ProspectCategory.INTERESTED
            ? (body.sampleShared ?? null)
            : null,
        createdByUserId: user.id
      }
    });

    const row = await tx.lead.findUniqueOrThrow({
      where: { id: lead.id },
      include: {
        payments: { orderBy: { markedAt: "desc" } },
        project: true,
        websiteTemplate: true
      }
    });

    await logActivity({
      prisma,
      tx,
      userId: user.id,
      action: ActivityAction.UPDATE,
      entityType: "Lead",
      entityId: lead.id,
      before: {
        prospectCategory: lead.prospectCategory,
        callbackScheduledAt: lead.callbackScheduledAt,
        interestedSampleShared: lead.interestedSampleShared
      },
      after: {
        prospectCategory: row.prospectCategory,
        callbackScheduledAt: row.callbackScheduledAt,
        interestedSampleShared: row.interestedSampleShared
      },
      request
    });

    return row;
  });
}

export async function seedNewLeadProspectCategoryEvent(
  tx: Prisma.TransactionClient,
  leadId: string,
  createdByUserId: string
): Promise<void> {
  await tx.leadProspectCategoryEvent.create({
    data: {
      leadId,
      category: ProspectCategory.NEW_LEAD,
      createdByUserId
    }
  });
}
