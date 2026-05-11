import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LeadStatusPanel } from "./LeadStatusPanel";
import type { Lead, PortalSettingsValues } from "../../types";

vi.mock("../../hooks/useSalesQueries", () => ({
  useTransitionLeadMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

const baseSettings: PortalSettingsValues = {
  commissionRateBps: 2000,
  commissionBasis: "VERIFIED_FINAL_PAYMENT",
  manualTransitions: [
    { from: "ADVANCE_PAID", to: "BUILDING", adminOnly: false, enabled: true },
    { from: "BUILDING", to: "PREVIEW_SENT", adminOnly: false, enabled: true },
    { from: "FINAL_PAID", to: "DEPLOYED", adminOnly: true, enabled: true }
  ],
  advancePaymentRequiredLeadStatus: "NEW",
  finalPaymentRequiredLeadStatus: "PREVIEW_SENT",
  advanceVerifyRequiredLeadStatus: "NEW",
  finalVerifyRequiredLeadStatus: "PREVIEW_SENT",
  terminalNoMutationStatuses: ["COMMISSION_PAID"],
  enforcePaymentQuoteToleranceBps: null,
  exportMaxRows: 50_000
};

function renderPanel(props: React.ComponentProps<typeof LeadStatusPanel>) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LeadStatusPanel {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function leadFixture(partial: Partial<Lead>): Lead {
  return {
    id: "lead-1",
    createdByUserId: "u-1",
    assignedToUserId: "u-2",
    clientName: "Acme",
    clientEmail: null,
    clientPhone: null,
    notes: null,
    status: "ADVANCE_PAID",
    advanceAmountCents: null,
    finalQuoteCents: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...partial
  };
}

describe("LeadStatusPanel", () => {
  it("renders nothing when lead is terminal", () => {
    const { container } = renderPanel({
      lead: leadFixture({ status: "COMMISSION_PAID" }),
      settings: baseSettings,
      role: "ADMIN",
      terminal: true
    });
    expect(container.firstChild).toBeNull();
  });

  it("renders allowed transitions for a sales rep", () => {
    renderPanel({
      lead: leadFixture({ status: "ADVANCE_PAID" }),
      settings: baseSettings,
      role: "SALES_REP",
      terminal: false
    });
    expect(screen.getByRole("button", { name: /Move to Work in Progress/i })).toBeInTheDocument();
  });

  it("hides admin-only transitions from sales reps", () => {
    renderPanel({
      lead: leadFixture({ status: "FINAL_PAID" }),
      settings: baseSettings,
      role: "SALES_REP",
      terminal: false
    });
    expect(screen.queryByRole("button", { name: /DEPLOYED/i })).not.toBeInTheDocument();
  });

  it("shows admin-only transitions to admins", () => {
    renderPanel({
      lead: leadFixture({ status: "FINAL_PAID" }),
      settings: baseSettings,
      role: "ADMIN",
      terminal: false
    });
    expect(screen.getByRole("button", { name: /Move to Site Deployed/i })).toBeInTheDocument();
  });

  it("renders nothing when no transitions are allowed", () => {
    const { container } = renderPanel({
      lead: leadFixture({ status: "NEW" }),
      settings: baseSettings,
      role: "SALES_REP",
      terminal: false
    });
    expect(container.firstChild).toBeNull();
  });
});
