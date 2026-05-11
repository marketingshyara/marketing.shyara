import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LeadEditForm } from "./LeadEditForm";
import type { Lead } from "../../types";

vi.mock("../../hooks/useSalesQueries", () => ({
  usePatchLeadMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useUsersQuery: () => ({
    data: { items: [], total: 0, page: 1, pageSize: 100 },
    isError: false,
    isLoading: false,
    refetch: vi.fn()
  })
}));

function renderForm(props: React.ComponentProps<typeof LeadEditForm>) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LeadEditForm {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const baseLead: Lead = {
  id: "lead-1",
  createdByUserId: "u-1",
  assignedToUserId: "u-2",
  clientName: "Acme",
  clientEmail: "a@b.com",
  clientPhone: "1234",
  notes: "n",
  status: "NEW",
  advanceAmountCents: 1000,
  finalQuoteCents: 5000,
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z"
};

describe("LeadEditForm", () => {
  it("populates the form from the lead", () => {
    renderForm({ lead: baseLead, isAdmin: false, terminal: false });
    expect(screen.getByLabelText(/Client name/i)).toHaveValue("Acme");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("a@b.com");
    expect(screen.getByLabelText(/Phone/i)).toHaveValue("1234");
    expect(screen.getByLabelText(/Advance/i)).toHaveValue("10");
    expect(screen.getByLabelText(/Final quote/i)).toHaveValue("50");
  });

  it("disables inputs and hides the submit button when terminal", () => {
    renderForm({ lead: baseLead, isAdmin: false, terminal: true });
    expect(screen.getByLabelText(/Client name/i)).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Save changes/i })).not.toBeInTheDocument();
  });

  it("shows the assignee select only to admins", () => {
    renderForm({ lead: baseLead, isAdmin: false, terminal: false });
    expect(screen.queryByLabelText(/Assigned sales rep/i)).not.toBeInTheDocument();

    renderForm({ lead: baseLead, isAdmin: true, terminal: false });
    expect(screen.getByLabelText(/Assigned sales rep/i)).toBeInTheDocument();
  });
});
