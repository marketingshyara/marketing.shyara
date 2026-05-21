import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PipelineDetailPage } from "./PipelineDetailPage";
import type { Lead, LeadDetailResponse } from "../../types";

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
  usePatchProjectMutation: (...args: unknown[]) => usePatchProjectMutation(...args)
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
    useWebsiteTemplatesQuery.mockReturnValue({ data: { items: [] }, isLoading: false });
    usePortalSettingsQuery.mockReturnValue({
      data: {
        settings: {
          minAgreedTotalCents: 799_900,
          advancePaymentShareBps: 5000,
          commissionRateBps: 3000,
          templatesCatalogUrl: "",
          tutorialLinks: [],
          painPointsByCategory: []
        }
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn()
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
    expect(screen.getByText(/what to do now/i)).toBeTruthy();
  });
});
