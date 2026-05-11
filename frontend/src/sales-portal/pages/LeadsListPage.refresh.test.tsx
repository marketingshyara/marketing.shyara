import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LeadsListPage } from "./LeadsListPage";

const refetch = vi.fn();

vi.mock("../hooks/useSalesQueries", () => ({
  useSessionQuery: () => ({
    data: { user: { id: "admin-1", email: "a@test", displayName: "A", role: "ADMIN", mustChangePassword: false } }
  }),
  useUsersQuery: () => ({ data: { items: [] } }),
  useLeadsQuery: () => ({
    data: { items: [], total: 0, page: 1, pageSize: 20 },
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: Date.now(),
    refetch
  })
}));

describe("LeadsListPage refresh", () => {
  it("calls refetch when Refresh is clicked", async () => {
    refetch.mockClear();
    const user = userEvent.setup();
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <LeadsListPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    await user.click(screen.getByRole("button", { name: /Refresh data/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
