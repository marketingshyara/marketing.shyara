import { describe, expect, it } from "vitest";
import { getPipelineStages, summarizePipelineStages } from "../src/services/pipeline.js";
import { parsePortalSettings } from "../src/validators/schemas.js";
import { LeadStatus, PaymentKind, PaymentVerificationStatus } from "@prisma/client";

describe("getPipelineStages", () => {
  const settings = parsePortalSettings({});

  it("shows convert as actionable for unconverted lead", () => {
    const stages = getPipelineStages(
      {
        id: "1",
        createdByUserId: "u",
        assignedToUserId: "u",
        clientName: "Acme",
        clientEmail: null,
        clientPhone: null,
        notes: null,
        status: LeadStatus.NEW,
        advanceAmountCents: null,
        finalQuoteCents: null,
        agreedTotalCents: null,
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
        createdAt: new Date(),
        updatedAt: new Date(),
        payments: []
      },
      settings,
      "SALES_REP"
    );
    const convert = stages.find((s) => s.key === "convert_deal");
    expect(convert?.state).toBe("actionable");
  });

  it("defaults min agreed total to 799900 paise", () => {
    expect(settings.minAgreedTotalCents).toBe(799_900);
    expect(settings.performanceBonusAmountCents).toBe(50_000);
    expect(settings.performanceBonusAfterCompletedSales).toBe(10);
  });

  it("locks whatsapp until advance is verified", () => {
    const stages = getPipelineStages(
      {
        id: "1",
        createdByUserId: "u",
        assignedToUserId: "u",
        clientName: "Acme",
        clientEmail: null,
        clientPhone: null,
        notes: null,
        status: LeadStatus.ADVANCE_PAID,
        advanceAmountCents: 400_000,
        finalQuoteCents: 400_000,
        agreedTotalCents: 800_000,
        websiteTemplateId: "tpl",
        contentReceivedAt: null,
        convertedAt: new Date(),
        whatsappGroupLink: "https://chat.whatsapp.com/example",
        whatsappVerifiedAt: null,
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
            kind: PaymentKind.ADVANCE,
            amountCents: 400_000,
            verificationStatus: PaymentVerificationStatus.PENDING,
            markedAt: new Date(),
            markedByUserId: "u",
            verifiedAt: null,
            verifiedByUserId: null,
            providerReference: null,
            repNote: null,
            adminNote: null,
            rejectionReason: null
          }
        ]
      },
      settings,
      "SALES_REP"
    );
    const wa = stages.find((s) => s.key === "whatsapp_group");
    expect(wa?.state).not.toBe("verified");
    expect(wa?.state).not.toBe("actionable");
  });

  it("summarizePipelineStages flags pending admin on advance verify", () => {
    const stages = getPipelineStages(
      {
        id: "1",
        createdByUserId: "u",
        assignedToUserId: "u",
        clientName: "Acme",
        clientEmail: null,
        clientPhone: null,
        notes: null,
        status: LeadStatus.ADVANCE_PAID,
        advanceAmountCents: 400_000,
        finalQuoteCents: 400_000,
        agreedTotalCents: 800_000,
        websiteTemplateId: "tpl",
        contentReceivedAt: null,
        convertedAt: new Date(),
        whatsappGroupLink: null,
        whatsappVerifiedAt: null,
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
            kind: PaymentKind.ADVANCE,
            amountCents: 400_000,
            verificationStatus: PaymentVerificationStatus.PENDING,
            markedAt: new Date(),
            markedByUserId: "u",
            verifiedAt: null,
            verifiedByUserId: null,
            providerReference: null,
            repNote: null,
            adminNote: null,
            rejectionReason: null
          }
        ]
      },
      settings,
      "ADMIN"
    );
    const summary = summarizePipelineStages(stages);
    expect(summary.pendingAdmin).toBe(true);
    expect(summary.currentStageKey).toBe("convert_deal");
  });
});
