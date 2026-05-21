import { describe, expect, it } from "vitest";
import { getPipelineStages } from "../src/services/pipeline.js";
import { parsePortalSettings } from "../src/validators/schemas.js";
import { LeadStatus, UserRole } from "@prisma/client";

describe("locked stage blockedReason", () => {
  const settings = parsePortalSettings({});

  it("sets blockedReason on locked demo_finalized", () => {
    const lead = {
      id: "1",
      createdByUserId: "u",
      assignedToUserId: "u",
      clientName: "Acme",
      clientEmail: null,
      clientPhone: null,
      notes: null,
      status: LeadStatus.BUILDING,
      advanceAmountCents: 400_000,
      finalQuoteCents: 400_000,
      agreedTotalCents: 800_000,
      websiteTemplateId: "tpl",
      contentReceivedAt: null,
      convertedAt: new Date(),
      whatsappGroupLink: "https://chat.whatsapp.com/x",
      whatsappVerifiedAt: new Date(),
      demoFinalizedAt: null,
      demoFinalizedVerifiedAt: null,
      accountsReadyAt: null,
      accountsReadyVerifiedAt: null,
      repoTransferVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      payments: [
        {
          id: "p1",
          leadId: "1",
          kind: "ADVANCE" as const,
          amountCents: 400_000,
          verificationStatus: "VERIFIED" as const,
          markedAt: new Date(),
          verifiedAt: new Date(),
          markedByUserId: "u",
          verifiedByUserId: "a",
          repNote: null,
          adminNote: null,
          externalReference: "ref",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      project: { previewUrl: null, deploymentSubmittedAt: null, deploymentVerifiedAt: null }
    };

    const demo = getPipelineStages(lead, settings, UserRole.SALES_REP).find(
      (s) => s.key === "demo_finalized"
    );
    expect(demo?.state).toBe("locked");
    expect(demo?.blockedReason).toMatch(/demo ready/i);
  });
});
