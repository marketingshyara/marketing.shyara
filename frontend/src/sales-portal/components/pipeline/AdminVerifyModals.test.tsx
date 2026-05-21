import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminVerifyModals } from "./AdminVerifyModals";
import type { Lead } from "../../types";

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
    expect(screen.getAllByText(/Verify the advance payment/i).length).toBeGreaterThan(0);
  });
});

describe("AdminVerifyModals later stages", () => {
  it("disables repo transfer verify until final payment is verified", () => {
    render(
      <AdminVerifyModals
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
    expect(screen.getByText(/due \(final\) payment/i)).toBeInTheDocument();
  });

  it("disables deployment verify until rep submitted live URL", () => {
    render(
      <AdminVerifyModals
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
