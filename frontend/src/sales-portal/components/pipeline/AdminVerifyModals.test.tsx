import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AdminVerifyModals } from "./AdminVerifyModals";
import type { Lead, PortalSettingsValues } from "../../types";
import { defaultPaymentShareMethods } from "../../lib/paymentShareMethods";

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
  performanceBonusBps: 0,
  performanceBonusAfterCompletedSales: 3,
  templatesCatalogUrl: "https://example.com/templates",
  tutorialLinks: [],
  painPointsByCategory: [],
  paymentShareMethods: defaultPaymentShareMethods()
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
    clientGithubId: null,
    clientGithubEmail: null,
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
      />
    );

    expect(screen.getByRole("button", { name: "1. Save preview URL" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2. Mark demo ready" })).toBeDisabled();
    expect(screen.getAllByText(/Verify advance payment first/i).length).toBeGreaterThan(0);
  });
});

describe("AdminVerifyModals later stages", () => {
  function leadWithFinalVerified(overrides: Partial<Lead> = {}): Lead {
    return leadWithAdvance({
      status: "FINAL_PAID",
      payments: [
        ...(leadWithAdvance().payments ?? []),
        {
          id: "pay-final",
          leadId: "lead-1",
          kind: "FINAL",
          amountCents: 40000,
          verificationStatus: "VERIFIED",
          externalReference: "ref-final",
          repNote: null,
          adminNote: null,
          markedByUserId: "rep-1",
          verifiedByUserId: "admin-1",
          verifiedAt: "2026-01-03T00:00:00.000Z",
          markedAt: "2026-01-03T00:00:00.000Z"
        }
      ],
      ...overrides
    });
  }

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
      />
    );

    expect(screen.getByRole("button", { name: "Verify repo transfer" })).toBeDisabled();
    expect(screen.getByText(/due payment first/i)).toBeInTheDocument();
  });

  it("requires transferred github repo link before verify when final is verified", async () => {
    const user = userEvent.setup();

    function RepoTransferHarness() {
      const [url, setUrl] = useState("");
      return (
        <AdminVerifyModals
          pipelineStages={[]}
          lead={leadWithFinalVerified({
            clientGithubId: "client-org",
            clientGithubEmail: "client@example.com"
          })}
          activeStage="repo_transfer"
          onClose={vi.fn()}
          previewUrl=""
          onPreviewUrlChange={vi.fn()}
          verify={verifyStub}
          onSavePreview={vi.fn()}
          savePreviewPending={false}
          onMarkDemoReady={vi.fn()}
          markDemoPending={false}
          transferredGithubRepoUrl={url}
          onTransferredGithubRepoUrlChange={setUrl}
        />
      );
    }

    render(<RepoTransferHarness />);

    expect(screen.getByRole("button", { name: "Verify repo transfer" })).toBeDisabled();
    expect(
      screen.getByLabelText(/Transferred GitHub repository link/i)
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Transferred GitHub repository link/i),
      "github.com/client-org/website"
    );
    expect(screen.getByRole("button", { name: "Verify repo transfer" })).toBeEnabled();
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
      />
    );

    expect(screen.getByRole("button", { name: "Mark commission paid" })).not.toBeDisabled();
  });

  it("shows read-only commission payout from agreed total", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithCommission({ agreedTotalCents: 50_000 })}
        activeStage="commission"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
      />
    );

    expect(screen.getByText("Agreed total", { selector: "dt" })).toBeInTheDocument();
    expect(document.getElementById("commission-payout")).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Payout amount/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save amount" })).not.toBeInTheDocument();
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
      />
    );

    await user.click(screen.getByRole("button", { name: "Mark commission paid" }));
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it("shows calculated payout from agreed total and portal rate", () => {
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
      />
    );

    expect(screen.getByText("Agreed total", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText(/^20%$/)).toBeInTheDocument();
    expect(screen.getByText(/₹100\.00/)).toBeInTheDocument();
    expect(screen.queryByText(/Estimate/i)).not.toBeInTheDocument();
  });
});

describe("AdminVerifyModals convert_deal", () => {
  it("shows readonly template card with sample preview", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance({
          websiteTemplateId: "RES/001",
          websiteTemplate: {
            id: "RES/001",
            slug: "res-001",
            name: "Restaurant Demo",
            displayCode: "RES/001",
            categoryId: "restaurant",
            sampleSlug: "restaurant-001",
            samplePath: null,
            sortOrder: 1
          }
        })}
        activeStage="convert_deal"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
      />
    );

    expect(screen.getByRole("heading", { name: /Deal submitted/i })).toBeInTheDocument();
    expect(screen.getByText("RES/001")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open sample/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/samples/websites/restaurant-001/")
    );
  });
});

describe("AdminVerifyModals whatsapp_group", () => {
  it("shows group link as clickable with copy action", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance({
          whatsappGroupLink: "https://chat.whatsapp.com/test-group"
        })}
        activeStage="whatsapp_group"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
      />
    );

    const link = screen.getByRole("link", { name: /chat\.whatsapp\.com\/test-group/i });
    expect(link).toHaveAttribute("href", "https://chat.whatsapp.com/test-group");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Copy Group link" })).toBeInTheDocument();
  });
});

describe("AdminVerifyModals accounts_ready", () => {
  it("shows github username and email as plain text with copy", () => {
    render(
      <AdminVerifyModals
        pipelineStages={[]}
        lead={leadWithAdvance({
          accountsReadyAt: "2026-01-02T12:00:00.000Z",
          clientGithubId: "acme-corp",
          clientGithubEmail: "client@example.com"
        })}
        activeStage="accounts_ready"
        onClose={vi.fn()}
        previewUrl=""
        onPreviewUrlChange={vi.fn()}
        verify={verifyStub}
        onSavePreview={vi.fn()}
        savePreviewPending={false}
        onMarkDemoReady={vi.fn()}
        markDemoPending={false}
      />
    );

    expect(screen.getByText("acme-corp")).toBeInTheDocument();
    expect(screen.getByText("client@example.com")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy GitHub username" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy GitHub account email" })).toBeInTheDocument();
  });
});
