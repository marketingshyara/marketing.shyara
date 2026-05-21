import { describe, expect, it } from "vitest";
import { getPipelineStages } from "../src/services/pipeline.js";
import { parsePortalSettings } from "../src/validators/schemas.js";
import { LeadStatus, UserRole } from "@prisma/client";

describe("demo_finalized admin gate", () => {
  const settings = parsePortalSettings({});

  const baseLead = {
    id: "1",
    createdByUserId: "u",
    assignedToUserId: "u",
    clientName: "Acme",
    clientEmail: null,
    clientPhone: null,
    notes: null,
    status: LeadStatus.PREVIEW_SENT,
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
    payments: [],
    project: { previewUrl: "https://preview.example", deploymentSubmittedAt: null, deploymentVerifiedAt: null }
  };

  it("locks accounts until demo is admin-verified", () => {
    const repStages = getPipelineStages(
      { ...baseLead, demoFinalizedAt: new Date(), demoFinalizedVerifiedAt: null },
      settings,
      UserRole.SALES_REP
    );
    const accounts = repStages.find((s) => s.key === "accounts_ready");
    expect(accounts?.state).toBe("locked");

    const adminStages = getPipelineStages(
      { ...baseLead, demoFinalizedAt: new Date(), demoFinalizedVerifiedAt: null },
      settings,
      UserRole.ADMIN
    );
    const demo = adminStages.find((s) => s.key === "demo_finalized");
    expect(demo?.state).toBe("actionable");
  });

  it("allows accounts after demo verified", () => {
    const stages = getPipelineStages(
      {
        ...baseLead,
        demoFinalizedAt: new Date(),
        demoFinalizedVerifiedAt: new Date()
      },
      settings,
      UserRole.SALES_REP
    );
    const accounts = stages.find((s) => s.key === "accounts_ready");
    expect(accounts?.state).toBe("actionable");
  });
});
