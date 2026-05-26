import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PipelineDetailPage } from "./PipelineDetailPage";
import type { Lead, LeadDetailResponse } from "../../types";
import { defaultPaymentShareMethods } from "../../lib/paymentShareMethods";

const useLeadQuery = vi.fn();
const usePortalSettingsQuery = vi.fn();
const useWebsiteTemplatesQuery = vi.fn();
const usePatchLeadMutation = vi.fn();
const useConvertLeadMutation = vi.fn();
const useMarkPaymentMutation = vi.fn();
const usePatchProjectMutation = vi.fn();

vi.mock("../../hooks/useSalesQueries", () => ({
  useLeadQuery: (...args: unknown[]) => useLeadQuery(...args),
  usePortalSettingsQuery: (...args: unknown[]) => usePortalSettingsQuery(...args),
  useWebsiteTemplatesQuery: (...args: unknown[]) => useWebsiteTemplatesQuery(...args),
  usePatchLeadMutation: (...args: unknown[]) => usePatchLeadMutation(...args),
  useConvertLeadMutation: (...args: unknown[]) => useConvertLeadMutation(...args),
  useMarkPaymentMutation: (...args: unknown[]) => useMarkPaymentMutation(...args),
  usePatchProjectMutation: (...args: unknown[]) => usePatchProjectMutation(...args),
  useDeleteLeadMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

const mockLead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-1",
  clientName: "Acme Corp",
  clientEmail: null,
  clientPhone: null,
  notes: null,
  status: "NEW",
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
  clientGithubId: null,
  clientGithubEmail: null,
  repoTransferVerifiedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

const mockDetail: LeadDetailResponse = {
  lead: mockLead,
  pipelineStages: [
    {
      key: "lead_capture",
      title: "Lead details",
      repActor: true,
      adminActor: false,
      state: "verified"
    },
    {
      key: "convert_deal",
      title: "Convert",
      repActor: true,
      adminActor: false,
      state: "actionable"
    }
  ]
};

function mutationStub() {
  return { mutate: vi.fn(), isPending: false };
}

function renderDetail() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/portal/pipeline/lead-1"]}>
        <Routes>
          <Route path="/portal/pipeline/:id" element={<PipelineDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PipelineDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePatchLeadMutation.mockReturnValue(mutationStub());
    useConvertLeadMutation.mockReturnValue(mutationStub());
    useMarkPaymentMutation.mockReturnValue(mutationStub());
    usePatchProjectMutation.mockReturnValue(mutationStub());
    usePortalSettingsQuery.mockReturnValue({
      data: {
        settings: {
          minAgreedTotalCents: 799_900,
          advancePaymentShareBps: 5000,
          commissionRateBps: 3000,
          templatesCatalogUrl: "https://example.com/templates",
          tutorialLinks: [],
          painPointsByCategory: [],
          paymentShareMethods: defaultPaymentShareMethods()
        }
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    });
    useWebsiteTemplatesQuery.mockReturnValue({
      data: {
        items: [
          {
            id: "RES/001",
            slug: "res-001",
            name: "Restaurant Demo",
            displayCode: "RES/001",
            categoryId: "restaurant",
            sampleSlug: "restaurant-001",
            samplePath: null,
            sortOrder: 1
          },
          {
            id: "GYM/001",
            slug: "gym-001",
            name: "Gym Demo",
            displayCode: "GYM/001",
            categoryId: "gym",
            sampleSlug: "gym-001",
            samplePath: null,
            sortOrder: 2
          }
        ]
      },
      isLoading: false
    });
  });

  it("survives loading then loaded transition without hook-order crash", () => {
    useLeadQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn()
    });

    const { rerender } = renderDetail();
    expect(document.querySelector(".animate-pulse")).toBeTruthy();

    useLeadQuery.mockReturnValue({
      data: mockDetail,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    expect(() => rerender(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/portal/pipeline/lead-1"]}>
          <Routes>
            <Route path="/portal/pipeline/:id" element={<PipelineDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )).not.toThrow();

    expect(screen.getByRole("heading", { level: 1, name: "Acme Corp" })).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("convert modal shows live advance and keeps submit disabled without payment method", async () => {
    const user = userEvent.setup();
    useLeadQuery.mockReturnValue({
      data: mockDetail,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderDetail();

    await user.click(screen.getByRole("button", { name: /Submit for approval/i }));

    expect(screen.getByLabelText(/Advance payment \(50%\)/i)).toHaveValue("—");

    await user.type(screen.getByLabelText(/Agreed total/i), "7999");
    expect(screen.getByLabelText(/Advance payment \(50%\)/i)).toHaveValue("₹3,999.50");
    expect(screen.getByText(/Due after build: ₹3,999.50/i)).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: /Submit for admin approval/i });
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText(/Payment method/i)).toBeInTheDocument();
  });

  it("pre-convert modal does not show a prominent catalog link at the top", async () => {
    const user = userEvent.setup();
    useLeadQuery.mockReturnValue({
      data: mockDetail,
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderDetail();
    await user.click(screen.getByRole("button", { name: /Submit for approval/i }));

    expect(screen.queryByRole("link", { name: /View template samples/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse all samples/i })).toBeInTheDocument();
  });

  it("post-convert pending modal allows Save template PATCH", async () => {
    const user = userEvent.setup({ pointerEventsCheck: false });
    const patchMutate = vi.fn();
    usePatchLeadMutation.mockReturnValue({ mutate: patchMutate, isPending: false });
    useLeadQuery.mockReturnValue({
      data: {
        lead: {
          ...mockLead,
          convertedAt: "2026-01-02T00:00:00.000Z",
          agreedTotalCents: 799_900,
          advanceAmountCents: 399_950,
          finalQuoteCents: 399_950,
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
        },
        pipelineStages: [
          {
            key: "convert_deal",
            title: "Convert",
            repActor: true,
            adminActor: false,
            state: "pending_admin"
          }
        ]
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderDetail();
    await user.click(screen.getByRole("button", { name: /View deal/i }));

    expect(screen.getByText(/until the WhatsApp group is verified/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Advance payment \(50%\)/i)).toHaveValue("₹3,999.50");
    expect(screen.getByRole("button", { name: /Save template/i })).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: /Website template/i }));
    await user.click(await screen.findByRole("option", { name: /GYM\/001 — Gym Demo/i }));

    const save = screen.getByRole("button", { name: /Save template/i });
    expect(save).toBeEnabled();
    await user.click(save);

    expect(patchMutate).toHaveBeenCalledWith(
      { websiteTemplateId: "GYM/001" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("locks template after WhatsApp verified", async () => {
    const user = userEvent.setup({ pointerEventsCheck: false });
    useLeadQuery.mockReturnValue({
      data: {
        lead: {
          ...mockLead,
          convertedAt: "2026-01-02T00:00:00.000Z",
          whatsappVerifiedAt: "2026-01-03T00:00:00.000Z",
          agreedTotalCents: 799_900,
          advanceAmountCents: 399_950,
          finalQuoteCents: 399_950,
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
        },
        pipelineStages: [
          {
            key: "convert_deal",
            title: "Convert",
            repActor: true,
            adminActor: false,
            state: "verified",
            hint: "Locked after admin approval."
          }
        ]
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderDetail();
    await user.click(screen.getByRole("button", { name: /View all pipeline steps/i }));
    await user.click(screen.getByRole("button", { name: /Convert, verified/i }));

    expect(screen.getByText(/Locked after WhatsApp group was verified/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Save template/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("due payment modal shows read-only amount from finalQuoteCents", async () => {
    const user = userEvent.setup();
    useLeadQuery.mockReturnValue({
      data: {
        lead: {
          ...mockLead,
          status: "PREVIEW_SENT",
          agreedTotalCents: 799_900,
          advanceAmountCents: 399_950,
          finalQuoteCents: 399_950,
          convertedAt: "2026-01-02T00:00:00.000Z",
          accountsReadyVerifiedAt: "2026-01-02T00:00:00.000Z",
          payments: [
            {
              id: "pay-fin",
              leadId: "lead-1",
              kind: "FINAL",
              amountCents: 399_950,
              verificationStatus: "PENDING",
              repNote: "upi_id",
              markedByUserId: "rep-1",
              markedAt: "2026-01-04T00:00:00.000Z",
              verifiedByUserId: null,
              verifiedAt: null,
              adminNote: null
            }
          ]
        },
        pipelineStages: [
          {
            key: "final_payment",
            title: "Due payment",
            repActor: true,
            adminActor: false,
            state: "pending_admin"
          }
        ]
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderDetail();
    await user.click(screen.getByRole("button", { name: /View submission/i }));

    expect(screen.getByText("Agreed total")).toBeInTheDocument();
    expect(screen.getByText("Advance")).toBeInTheDocument();
    expect(screen.getByText("Due amount")).toBeInTheDocument();
    expect(screen.getByText("Submitted at")).toBeInTheDocument();
  });
});

describe("PipelineDetailPage demo preview", () => {
  const demoStages: LeadDetailResponse["pipelineStages"] = [
    {
      key: "build_demo",
      title: "Website build & demo link",
      repActor: false,
      adminActor: true,
      state: "pending_admin",
      hint: "Waiting on technical team"
    },
    {
      key: "demo_finalized",
      title: "Demo approved by client",
      repActor: true,
      adminActor: true,
      state: "actionable"
    }
  ];

  function leadWithPreview(overrides: Partial<Lead> = {}): LeadDetailResponse {
    return {
      lead: {
        ...mockLead,
        convertedAt: "2026-01-02T00:00:00.000Z",
        whatsappVerifiedAt: "2026-01-02T00:00:00.000Z",
        status: "BUILDING",
        project: {
          id: "proj-1",
          leadId: "lead-1",
          previewUrl: "https://demo.test/preview",
          deployedUrl: null,
          deploymentSubmittedAt: null,
          deploymentVerifiedAt: null,
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z"
        },
        ...overrides
      },
      pipelineStages: demoStages
    };
  }

  beforeEach(() => {
    useLeadQuery.mockReturnValue({
      data: leadWithPreview(),
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });
  });

  it("shows demo preview link in demo_finalized modal", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: /Mark demo approved/i }));

    const link = screen.getByRole("link", { name: /demo\.test\/preview/i });
    expect(link).toHaveAttribute("href", "https://demo.test/preview");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Copy Demo preview" })).toBeInTheDocument();
  });

  it("opens build_demo read-only modal from accordion when preview URL exists", async () => {
    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: /View all pipeline steps/i }));
    await user.click(
      screen.getByRole("button", { name: /Website build & demo link, pending_admin/i })
    );

    expect(screen.getByRole("dialog", { name: /Demo preview link/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /demo\.test\/preview/i })).toBeInTheDocument();
  });

  it("shows not-ready message in demo_finalized modal when preview URL is missing", async () => {
    useLeadQuery.mockReturnValue({
      data: leadWithPreview({
        project: {
          id: "proj-1",
          leadId: "lead-1",
          previewUrl: null,
          deployedUrl: null,
          deploymentSubmittedAt: null,
          deploymentVerifiedAt: null,
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z"
        }
      }),
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: /Mark demo approved/i }));

    expect(
      screen.getByText(/Demo preview not ready yet — waiting on technical team/i)
    ).toBeInTheDocument();
  });

  it("keeps Mark demo finalized disabled when preview URL is missing", async () => {
    useLeadQuery.mockReturnValue({
      data: leadWithPreview({
        project: {
          id: "proj-1",
          leadId: "lead-1",
          previewUrl: null,
          deployedUrl: null,
          deploymentSubmittedAt: null,
          deploymentVerifiedAt: null,
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z"
        }
      }),
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: /Mark demo approved/i }));

    expect(screen.getByRole("button", { name: /Mark demo finalized/i })).toBeDisabled();
  });

  it("verified WhatsApp stage opens read-only without Save", async () => {
    const user = userEvent.setup();
    useLeadQuery.mockReturnValue({
      data: {
        lead: {
          ...mockLead,
          status: "BUILDING",
          convertedAt: "2026-01-02T00:00:00.000Z",
          whatsappGroupLink: "https://chat.whatsapp.com/abc",
          whatsappVerifiedAt: "2026-01-03T00:00:00.000Z",
          payments: [
            {
              id: "pay-adv",
              leadId: "lead-1",
              kind: "ADVANCE",
              amountCents: 399_950,
              verificationStatus: "VERIFIED",
              repNote: null,
              markedByUserId: "rep-1",
              markedAt: "2026-01-02T00:00:00.000Z",
              verifiedByUserId: "admin-1",
              verifiedAt: "2026-01-02T00:00:00.000Z",
              adminNote: null
            }
          ]
        },
        pipelineStages: [
          {
            key: "whatsapp_group",
            title: "WhatsApp group",
            repActor: true,
            adminActor: false,
            state: "verified",
            hint: "Locked after admin approval."
          }
        ]
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderDetail();
    await user.click(screen.getByRole("button", { name: /View all pipeline steps/i }));
    await user.click(
      screen.getByRole("button", { name: /WhatsApp group, verified/i })
    );

    const dialog = screen.getByRole("dialog", { name: /WhatsApp group/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Save$/i })).not.toBeInTheDocument();
    expect(screen.getByText("Verified by admin")).toBeInTheDocument();
  });

  it("keeps build_demo step disabled when preview URL is missing", async () => {
    useLeadQuery.mockReturnValue({
      data: leadWithPreview({
        project: {
          id: "proj-1",
          leadId: "lead-1",
          previewUrl: null,
          deployedUrl: null,
          deploymentSubmittedAt: null,
          deploymentVerifiedAt: null,
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z"
        }
      }),
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    const user = userEvent.setup();
    renderDetail();

    await user.click(screen.getByRole("button", { name: /View all pipeline steps/i }));

    expect(
      screen.getByRole("button", { name: /Website build & demo link, pending_admin/i })
    ).toBeDisabled();
  });
});
