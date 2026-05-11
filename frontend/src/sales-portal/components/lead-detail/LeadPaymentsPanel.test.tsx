import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LeadPaymentsPanel } from "./LeadPaymentsPanel";
import type { Lead, PortalSettingsValues } from "../../types";

vi.mock("../../hooks/useSalesQueries", () => ({
  useMarkPaymentMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useVerifyPaymentMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

const settings: PortalSettingsValues = {
  commissionRateBps: 2000,
  commissionBasis: "VERIFIED_FINAL_PAYMENT",
  manualTransitions: [],
  advancePaymentRequiredLeadStatus: "NEW",
  finalPaymentRequiredLeadStatus: "PREVIEW_SENT",
  advanceVerifyRequiredLeadStatus: "NEW",
  finalVerifyRequiredLeadStatus: "PREVIEW_SENT",
  terminalNoMutationStatuses: ["COMMISSION_PAID"],
  enforcePaymentQuoteToleranceBps: null,
  exportMaxRows: 50_000
};

function renderPanel(props: React.ComponentProps<typeof LeadPaymentsPanel>) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LeadPaymentsPanel {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function lead(partial: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    createdByUserId: "u-1",
    assignedToUserId: "u-2",
    clientName: "Acme",
    clientEmail: null,
    clientPhone: null,
    notes: null,
    status: "NEW",
    advanceAmountCents: null,
    finalQuoteCents: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    payments: [],
    ...partial
  };
}

describe("LeadPaymentsPanel", () => {
  it("hides the mark-payment form when terminal", () => {
    renderPanel({
      lead: lead({ status: "COMMISSION_PAID" }),
      settings,
      isAdmin: false,
      terminal: true
    });
    expect(screen.queryByRole("button", { name: /Record Payment/i })).not.toBeInTheDocument();
  });

  it("offers ADVANCE option when lead status matches advance gate", () => {
    renderPanel({ lead: lead({ status: "NEW" }), settings, isAdmin: false, terminal: false });
    expect(screen.getByRole("button", { name: /Record Payment/i })).toBeInTheDocument();
  });

  it("renders nothing when neither mark form nor payments are available", () => {
    const { container } = renderPanel({
      lead: lead({ status: "BUILDING", payments: [] }),
      settings,
      isAdmin: false,
      terminal: false
    });
    expect(container.firstChild).toBeNull();
  });

  it("shows the payments table when there are payments", () => {
    renderPanel({
      lead: lead({
        status: "ADVANCE_PAID",
        payments: [
          {
            id: "p-1",
            leadId: "lead-1",
            kind: "ADVANCE",
            amountCents: 10000,
            repNote: null,
            markedByUserId: "u-1",
            markedAt: "2026-05-01T00:00:00.000Z",
            verificationStatus: "PENDING",
            verifiedByUserId: null,
            verifiedAt: null,
            adminNote: null
          }
        ]
      }),
      settings,
      isAdmin: true,
      terminal: false
    });
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Verify$/i })).toBeInTheDocument();
  });

  it("hides admin actions column for non-admins", () => {
    renderPanel({
      lead: lead({
        status: "ADVANCE_PAID",
        payments: [
          {
            id: "p-1",
            leadId: "lead-1",
            kind: "ADVANCE",
            amountCents: 10000,
            repNote: null,
            markedByUserId: "u-1",
            markedAt: "2026-05-01T00:00:00.000Z",
            verificationStatus: "PENDING",
            verifiedByUserId: null,
            verifiedAt: null,
            adminNote: null
          }
        ]
      }),
      settings,
      isAdmin: false,
      terminal: false
    });
    expect(screen.queryByRole("button", { name: /^Verify$/i })).not.toBeInTheDocument();
  });
});
