import { describe, expect, it } from "vitest";
import { getPipelineStages } from "../src/services/pipeline.js";
import { parsePortalSettings } from "../src/validators/schemas.js";
import { LeadStatus, UserRole } from "@prisma/client";

const settings = parsePortalSettings({});

function baseLead(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    createdByUserId: "rep",
    assignedToUserId: "rep",
    clientName: "Acme",
    clientEmail: null,
    clientPhone: null,
    notes: null,
    status: LeadStatus.NEW,
    advanceAmountCents: 400_000,
    finalQuoteCents: 400_000,
    agreedTotalCents: 800_000,
    websiteTemplateId: null,
    contentReceivedAt: null,
    convertedAt: null,
    whatsappGroupLink: null,
    whatsappVerifiedAt: null,
    demoFinalizedAt: null,
    demoFinalizedVerifiedAt: null,
    accountsReadyAt: null,
    accountsReadyVerifiedAt: null,
    repoTransferVerifiedAt: null,
    stageDeclineNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    payments: [],
    project: null,
    ...overrides
  };
}

describe("pipeline declineNote attachment", () => {
  it("surfaces stored stage decline for rep resubmit", () => {
    const lead = baseLead({
      convertedAt: new Date(),
      status: LeadStatus.ADVANCE_PAID,
      payments: [
        {
          id: "p1",
          leadId: "1",
          kind: "ADVANCE",
          amountCents: 400_000,
          verificationStatus: "VERIFIED",
          markedAt: new Date(),
          verifiedAt: new Date(),
          markedByUserId: "rep",
          verifiedByUserId: "admin",
          repNote: null,
          adminNote: null,
          externalReference: "ref"
        }
      ],
      whatsappVerifiedAt: new Date(),
      project: { previewUrl: "https://x.com", deploymentSubmittedAt: null, deploymentVerifiedAt: null },
      demoFinalizedVerifiedAt: new Date(),
      stageDeclineNotes: {
        accounts_ready: {
          adminNote: "Use client GitHub org",
          declinedAt: new Date().toISOString()
        }
      }
    });

    const stage = getPipelineStages(lead, settings, UserRole.SALES_REP).find(
      (s) => s.key === "accounts_ready"
    );
    expect(stage?.state).toBe("actionable");
    expect(stage?.declineNote).toBe("Use client GitHub org");
  });

  it("surfaces payment decline on locked advance_verify for admin", () => {
    const lead = baseLead({
      payments: [
        {
          id: "p1",
          leadId: "1",
          kind: "ADVANCE",
          amountCents: 400_000,
          verificationStatus: "REJECTED",
          markedAt: new Date(),
          verifiedAt: new Date(),
          markedByUserId: "rep",
          verifiedByUserId: "admin",
          repNote: null,
          adminNote: "Wrong Razorpay id",
          externalReference: null
        }
      ]
    });

    const stage = getPipelineStages(lead, settings, UserRole.ADMIN).find(
      (s) => s.key === "advance_verify"
    );
    expect(stage?.state).toBe("locked");
    expect(stage?.declineNote).toBe("Wrong Razorpay id");
  });
});
