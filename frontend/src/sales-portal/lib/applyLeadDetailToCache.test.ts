import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { qk } from "../queryKeys";
import { applyLeadDetailToCache } from "./applyLeadDetailToCache";
import type { Lead, LeadDetailResponse } from "../types";

const baseLead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-1",
  clientName: "Acme",
  clientEmail: null,
  clientPhone: null,
  notes: null,
  status: "BUILDING",
  advanceAmountCents: 10000,
  finalQuoteCents: null,
  agreedTotalCents: 50000,
  websiteTemplateId: null,
  contentReceivedAt: null,
  convertedAt: "2026-01-01T00:00:00.000Z",
  whatsappGroupLink: null,
  whatsappVerifiedAt: null,
  demoFinalizedAt: null,
  demoFinalizedVerifiedAt: null,
  accountsReadyAt: null,
  accountsReadyVerifiedAt: null,
  repoTransferVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

describe("applyLeadDetailToCache", () => {
  it("sets lead detail query data immediately", () => {
    const qc = new QueryClient();
    const detail: LeadDetailResponse = {
      lead: {
        ...baseLead,
        project: {
          id: "proj-1",
          leadId: "lead-1",
          title: "Site",
          metadata: null,
          previewUrl: "https://demo.example.com",
          deployedUrl: null,
          deploymentSubmittedAt: null,
          deploymentVerifiedAt: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z"
        },
        payments: [
          {
            id: "pay-1",
            leadId: "lead-1",
            kind: "ADVANCE",
            amountCents: 10000,
            verificationStatus: "VERIFIED",
            externalReference: "ref",
            repNote: null,
            adminNote: null,
            markedByUserId: "rep-1",
            verifiedByUserId: "admin-1",
            verifiedAt: "2026-01-02T00:00:00.000Z",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z"
          }
        ]
      },
      pipelineStages: []
    };

    applyLeadDetailToCache(qc, "lead-1", detail);
    expect(qc.getQueryData(qk.lead("lead-1"))).toEqual(detail);
  });
});
