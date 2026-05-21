import { describe, expect, it } from "vitest";
import { getPipelineStages } from "../src/services/pipeline.js";
import { parsePortalSettings } from "../src/validators/schemas.js";
import { LeadStatus, UserRole } from "@prisma/client";

describe("deployment_submit pipeline gate", () => {
  const settings = parsePortalSettings({});

  const lead = {
    id: "1",
    createdByUserId: "u",
    assignedToUserId: "u",
    clientName: "Acme",
    clientEmail: null,
    clientPhone: null,
    notes: null,
    status: LeadStatus.FINAL_PAID,
    advanceAmountCents: 400_000,
    finalQuoteCents: 400_000,
    agreedTotalCents: 800_000,
    websiteTemplateId: "tpl",
    contentReceivedAt: null,
    convertedAt: new Date(),
    whatsappGroupLink: "https://chat.whatsapp.com/x",
    whatsappVerifiedAt: new Date(),
    demoFinalizedAt: new Date(),
    demoFinalizedVerifiedAt: new Date(),
    accountsReadyAt: new Date(),
    accountsReadyVerifiedAt: new Date(),
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
      },
      {
        id: "p2",
        leadId: "1",
        kind: "FINAL" as const,
        amountCents: 400_000,
        verificationStatus: "VERIFIED" as const,
        markedAt: new Date(),
        verifiedAt: new Date(),
        markedByUserId: "u",
        verifiedByUserId: "a",
        repNote: null,
        adminNote: null,
        externalReference: "ref2",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    project: { previewUrl: "https://p.example", deploymentSubmittedAt: null, deploymentVerifiedAt: null }
  };

  it("locks deployment_submit for rep until repo transfer verified", () => {
    const stages = getPipelineStages(lead, settings, UserRole.SALES_REP);
    const deploy = stages.find((s) => s.key === "deployment_submit");
    expect(deploy?.state).toBe("locked");
  });

  it("allows deployment_submit for rep after repo transfer", () => {
    const withRepo = { ...lead, repoTransferVerifiedAt: new Date() };
    const deploy = getPipelineStages(withRepo, settings, UserRole.SALES_REP).find(
      (s) => s.key === "deployment_submit"
    );
    expect(deploy?.state).toBe("actionable");
  });
});
