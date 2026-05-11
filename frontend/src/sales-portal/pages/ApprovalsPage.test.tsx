import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ApprovalsPage } from "./ApprovalsPage";

vi.mock("../hooks/useSalesQueries", () => ({
  usePendingPaymentsQuery: () => ({
    data: {
      items: [
        {
          id: "pay-1",
          leadId: "lead-1",
          kind: "ADVANCE",
          amountCents: 1000,
          repNote: "Cash",
          markedByUserId: "u-1",
          markedAt: "2026-05-01T12:00:00.000Z",
          verificationStatus: "PENDING",
          verifiedByUserId: null,
          verifiedAt: null,
          adminNote: null,
          lead: { id: "lead-1", clientName: "Acme Co", assignedToUserId: "u-2" },
          markedBy: { id: "u-1", displayName: "Rep One", email: "rep@test.local" }
        }
      ],
      total: 1,
      page: 1,
      pageSize: 20
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch: vi.fn()
  }),
  useVerifyPaymentMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

describe("ApprovalsPage", () => {
  it("renders pending payment row and client link", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <ApprovalsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole("heading", { name: /Payment approvals/i })).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /Acme Co/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/portal/leads/lead-1");
    expect(screen.getAllByRole("button", { name: /Verify/i }).length).toBeGreaterThanOrEqual(1);
  });
});
