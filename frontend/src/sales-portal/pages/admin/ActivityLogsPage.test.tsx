import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ActivityLogsPage } from "./ActivityLogsPage";

const useSessionQuery = vi.fn();
const useActivityLogsQuery = vi.fn();

vi.mock("../../hooks/useSalesQueries", () => ({
  useSessionQuery: (...args: unknown[]) => useSessionQuery(...args),
  useActivityLogsQuery: (...args: unknown[]) => useActivityLogsQuery(...args)
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ActivityLogsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ActivityLogsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionQuery.mockReturnValue({
      data: { user: { id: "a1", role: "ADMIN", email: "admin@test.local" } },
      isLoading: false
    });
  });

  it("renders page header and empty state when no logs", () => {
    useActivityLogsQuery.mockReturnValue({
      data: { items: [], total: 0, page: 1, pageSize: 25 },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderPage();

    expect(screen.getByRole("heading", { name: /activity log/i })).toBeInTheDocument();
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("renders activity rows when data exists", () => {
    useActivityLogsQuery.mockReturnValue({
      data: {
        items: [
          {
            id: "log-1",
            userId: "u1",
            action: "LOGIN",
            entityType: "user",
            entityId: "u1",
            metadata: null,
            createdAt: "2026-05-21T12:00:00.000Z",
            user: { id: "u1", displayName: "Admin", email: "admin@test.local" }
          }
        ],
        total: 1,
        page: 1,
        pageSize: 25
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });

    renderPage();

    expect(screen.getByText(/signed in/i)).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
