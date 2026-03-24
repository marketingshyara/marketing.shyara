import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import PortalLoginPage from "./PortalLoginPage";

test("starts with blank login fields and shows seeded local test accounts", () => {
  const queryClient = new QueryClient();

  render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PortalLoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

  expect(screen.getByLabelText(/email/i)).toHaveValue("");
  expect(screen.getByLabelText(/password/i)).toHaveValue("");
  expect(screen.getByText(/local test accounts/i)).toBeInTheDocument();
  expect(screen.getByText("admin@shyara.local")).toBeInTheDocument();
  expect(screen.getAllByText("password123").length).toBeGreaterThan(0);
});
