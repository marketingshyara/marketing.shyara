import { PortalProtectedRoute } from "@/components/portal/PortalGuards";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

test("redirects unauthenticated users to the portal login route", async () => {
  const originalFetch = global.fetch;

  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ message: "Login required." }),
    headers: new Headers({ "content-type": "application/json" })
  }) as typeof fetch;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/sales-portal/dashboard"]}>
        <Routes>
          <Route path="/sales-portal/login" element={<div>Portal Login</div>} />
          <Route element={<PortalProtectedRoute />}>
            <Route path="/sales-portal/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  expect(await screen.findByText("Portal Login")).toBeInTheDocument();
  global.fetch = originalFetch;
});
