import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminVerifyModals } from "./AdminVerifyModals";
import type { Lead, PortalSettingsValues } from "../../types";

const adminSettingsStub: PortalSettingsValues = {
  minAgreedTotalCents: 0,
  advancePaymentShareBps: 5000,
  commissionRateBps: 2000,
  commissionBasis: "AGREED_TOTAL",
  commissionRounding: "round",
  manualTransitions: [],
  advancePaymentRequiredLeadStatus: "NEW",
  finalPaymentRequiredLeadStatus: "BUILDING",
  advanceVerifyRequiredLeadStatus: "NEW",
  finalVerifyRequiredLeadStatus: "BUILDING",
  terminalNoMutationStatuses: ["COMMISSION_PAID"],
  enforcePaymentQuoteToleranceBps: null,
  exportMaxRows: 5000,
  performanceBonusAmountCents: 0,
  performanceBonusAfterCompletedSales: 3,
  templatesCatalogUrl: "https://example.com/templates",
  tutorialLinks: [],
  painPointsByCategory: []
};

vi.mock("../../hooks/useSalesQueries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../hooks/useSalesQueries")>();
  return {
    ...actual,
    useAdminSettingsQuery: vi.fn((enabled: boolean) => ({
      data: enabled ? { settings: adminSettingsStub } : undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    }))
  };
});

const verifyStub = {
  onVerify: vi.fn(),
  onDecline: vi.fn(),
  isPending: false,
  declineNote: "",
  onDeclineNoteChange: vi.fn()
};

function leadWithAdvance(overrides: Partial<Lead> = {}): Lead {
  return {
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
    updatedAt: "2026-01-01T00:00:00.000Z",
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
    ],
    project: undefined,
    ...overrides
  };
}

describe("AdminVerifyModals build_demo", () => {
  it("enables Mark demo ready when draft URL is valid before server save", () => {
    const onMarkDemoReady = vi.fn();
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance()}
        activeStage="build_demo"
        onClose={vi.fn()}
        previewUrl="example.com"
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={onMarkDemoReady}
        markDemoPending={false}
        commissionEditRupees=""
        onCommissionEditRupeesChange={vi.fn()}
      />
    );

    const markBtn = screen.getByRole("button", { name: "2. Mark demo ready" });
    expect(markBtn).not.toBeDisabled();
  });

  it("calls onMarkDemoReady when Mark demo ready is clicked", async () => {
    const user = userEvent.setup();
    const onMarkDemoReady = vi.fn();
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance({
          project: {
            id: "p1",
            leadId: "lead-1",
            title: "Site",
            metadata: null,
            previewUrl: "https://saved.test",
            deployedUrl: null,
            deploymentSubmittedAt: null,
            deploymentVerifiedAt: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z"
          }
        })}
        activeStage="build_demo"
        onClose={vi.fn()}
        previewUrl="https://saved.test"
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={onMarkDemoReady}
        markDemoPending={false}
        commissionEditRupees=""
        onCommissionEditRupeesChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "2. Mark demo ready" }));
    expect(onMarkDemoReady).toHaveBeenCalledTimes(1);
  });

  it("disables save and mark when advance is not verified", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance({ payments: [] })}
        activeStage="build_demo"
        onClose={vi.fn()}
        previewUrl="example.com"
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees=""
        onCommissionEditRupeesChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "1. Save preview URL" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2. Mark demo ready" })).toBeDisabled();
    expect(screen.getAllByText(/Verify advance payment first/i).length).toBeGreaterThan(0);
  });
});

describe("AdminVerifyModals later stages", () => {
  it("disables repo transfer verify until final payment is verified", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance()}
        activeStage="repo_transfer"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees=""
        onCommissionEditRupeesChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Verify repo transfer" })).toBeDisabled();
    expect(screen.getByText(/due payment first/i)).toBeInTheDocument();
  });

  it("disables deployment verify until rep submitted live URL", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance({
          project: {
            id: "p1",
            leadId: "lead-1",
            title: "Site",
            metadata: null,
            previewUrl: "https://demo.test",
            deployedUrl: null,
            deploymentSubmittedAt: null,
            deploymentVerifiedAt: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z"
          }
        })}
        activeStage="deployment_verify"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees=""
        onCommissionEditRupeesChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Verify deployment" })).toBeDisabled();
    expect(screen.getByText(/submit the live URL/i)).toBeInTheDocument();
  });
});

describe("AdminVerifyModals commission", () => {
  function leadWithCommission(overrides: Partial<Lead> = {}): Lead {
    return leadWithAdvance({
      status: "FINAL_PAID",
      agreedTotalCents: 50_000,
      commission: {
        id: "comm-1",
        leadId: "lead-1",
        repUserId: "rep-1",
        amountCents: 10_000,
        bonusCents: 0,
        isPaid: false,
        paidAt: null,
        paidByAdminId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      },
      project: {
        id: "p1",
        leadId: "lead-1",
        title: "Site",
        metadata: null,
        previewUrl: "https://demo.test",
        deployedUrl: "https://live.test",
        deploymentSubmittedAt: "2026-02-01T00:00:00.000Z",
        deploymentVerifiedAt: "2026-02-02T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-02-02T00:00:00.000Z"
      },
      ...overrides
    });
  }

  it("enables Mark commission paid when deployment is verified and status is FINAL_PAID", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithCommission()}
        activeStage="commission"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees="100"
        onCommissionEditRupeesChange={vi.fn()}
        onPatchCommission={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Mark commission paid" })).not.toBeDisabled();
  });

  it("shows an empty payout field when parent passes empty string (no modal refill)", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithCommission()}
        activeStage="commission"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees=""
        onCommissionEditRupeesChange={vi.fn()}
        onPatchCommission={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Payout amount/i)).toHaveValue("");
  });

  it("calls onVerify when Mark commission paid is clicked", async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn();
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithCommission()}
        activeStage="commission"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={{ ...verifyStub, onVerify }}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees="100"
        onCommissionEditRupeesChange={vi.fn()}
        onPatchCommission={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mark commission paid" }));
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it("shows calculated estimate from portal settings", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithCommission()}
        activeStage="commission"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
        commissionEditRupees="100"
        onCommissionEditRupeesChange={vi.fn()}
        onPatchCommission={vi.fn()}
      />
    );

    expect(screen.getByText(/Estimate/i)).toBeInTheDocument();
    expect(screen.getByText(/Agreed project total/i)).toBeInTheDocument();
    expect(screen.getByText(/^20%$/)).toBeInTheDocument();
  });
});
