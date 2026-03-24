import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PortalLayout } from "./PortalLayout";

const { sessionUser } = vi.hoisted(() => ({
  sessionUser: {
    id: "user-admin",
    name: "Portal Admin",
    email: "admin@shyara.local",
    role: "admin" as const,
    status: "active" as const,
    mustChangePassword: false,
    createdAt: "2026-03-24T09:00:00.000Z",
    updatedAt: "2026-03-24T09:00:00.000Z"
  }
}));

vi.mock("@/components/portal/PortalGuards", () => ({
  usePortalSession: () => ({
    data: {
      authenticated: true,
      user: sessionUser
    }
  })
}));

vi.mock("@/lib/portal-api", () => ({
  portalApi: {
    notifications: vi.fn().mockResolvedValue([
      {
        id: "notification-1",
        title: "Lead assigned",
        message: "A new lead was assigned.",
        type: "lead",
        createdAt: "2026-03-24T09:30:00.000Z"
      }
    ]),
    logout: vi.fn().mockResolvedValue({ ok: true }),
    markNotificationRead: vi.fn().mockResolvedValue({ ok: true }),
    changePassword: vi.fn().mockResolvedValue({ ok: true, user: sessionUser })
  }
}));

test("renders a mobile navigation toggle for the portal shell", async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/sales-portal/dashboard"]}>
          <Routes>
            <Route path="/sales-portal" element={<PortalLayout />}>
              <Route path="dashboard" element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

  expect(await screen.findByRole("button", { name: /open navigation/i })).toBeInTheDocument();
  expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
});
