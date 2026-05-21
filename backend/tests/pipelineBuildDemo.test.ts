import { describe, expect, it } from "vitest";
import { getPipelineStages } from "../src/services/pipeline.js";
import { parsePortalSettings } from "../src/validators/schemas.js";
import { LeadStatus, UserRole } from "@prisma/client";

describe("build_demo pipeline state", () => {
  const settings = parsePortalSettings({});

  const baseLead = {
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

  it("admin build_demo is actionable when WhatsApp verified and no preview", () => {
    const stages = getPipelineStages(baseLead, settings, UserRole.ADMIN);
    const build = stages.find((s) => s.key === "build_demo");
    expect(build?.state).toBe("actionable");
    expect(build?.hint).toBeUndefined();
  });

  it("rep build_demo is pending_admin with hint while waiting for demo link", () => {
    const stages = getPipelineStages(baseLead, settings, UserRole.SALES_REP);
    const build = stages.find((s) => s.key === "build_demo");
    expect(build?.state).toBe("pending_admin");
    expect(build?.hint).toBe("Waiting on technical team");
  });

  it("preview URL saved without PREVIEW_SENT is not verified for build_demo", () => {
    const withPreview = {
      ...baseLead,
      project: {
        previewUrl: "https://preview.example.com",
        deploymentSubmittedAt: null,
        deploymentVerifiedAt: null
      }
    };
    const adminStages = getPipelineStages(withPreview, settings, UserRole.ADMIN);
    const build = adminStages.find((s) => s.key === "build_demo");
    expect(build?.state).toBe("actionable");
    const repStages = getPipelineStages(withPreview, settings, UserRole.SALES_REP);
    expect(repStages.find((s) => s.key === "build_demo")?.state).toBe("pending_admin");
  });

  it("build_demo is verified only after PREVIEW_SENT status", () => {
    const sent = {
      ...baseLead,
      status: LeadStatus.PREVIEW_SENT,
      project: {
        previewUrl: "https://preview.example.com",
        deploymentSubmittedAt: null,
        deploymentVerifiedAt: null
      }
    };
    const build = getPipelineStages(sent, settings, UserRole.ADMIN).find((s) => s.key === "build_demo");
    expect(build?.state).toBe("verified");
  });
});
