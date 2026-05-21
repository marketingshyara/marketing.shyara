import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PipelineDetailGate } from "./PipelineDetailGate";
import type { Lead, LeadDetailResponse } from "../../types";

const useSessionQuery = vi.fn();
const useLeadQuery = vi.fn();

vi.mock("../../hooks/useSalesQueries", () => ({
  useSessionQuery: (...args: unknown[]) => useSessionQuery(...args),
  useLeadQuery: (...args: unknown[]) => useLeadQuery(...args),
  usePortalSettingsQuery: () => ({
    data: { settings: { minAgreedTotalCents: 799_900, advancePaymentShareBps: 5000 } },
    isLoading: false,
    isError: false,
    refetch: vi.fn()
  }),
  useWebsiteTemplatesQuery: () => ({ data: { items: [] }, isLoading: false }),
  usePatchLeadMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useConvertLeadMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useMarkPaymentMutation: () => ({ mutate: vi.fn(), isPending: false }),
  usePatchProjectMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

const mockLead: Lead = {
  id: "lead-1",
  createdByUserId: "rep-1",
  assignedToUserId: "rep-99",
  clientName: "Acme",
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

function renderGate(initialEntry = "/portal/pipeline/lead-1") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/portal/pipeline/:id" element={<PipelineDetailGate />} />
          <Route
            path="/portal/team/:repId/projects/:leadId"
            element={<div data-testid="admin-project">Admin project</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PipelineDetailGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects admin to team project URL", async () => {
    useSessionQuery.mockReturnValue({
      data: { user: { id: "a1", role: "ADMIN", email: "a@test.local" } },
      isLoading: false,
      isFetching: false
    });
    useLeadQuery.mockReturnValue({
      data: { lead: mockLead, pipelineStages: [] } satisfies LeadDetailResponse,
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    });

    renderGate();
    expect(await screen.findByTestId("admin-project")).toBeTruthy();
  });
});
