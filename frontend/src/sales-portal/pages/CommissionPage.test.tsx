import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommissionPage } from "./CommissionPage";

const useSessionQuery = vi.fn();
const useCommissionsQuery = vi.fn();
const usePortalSettingsQuery = vi.fn();
const useAdminSettingsQuery = vi.fn();

vi.mock("../hooks/useSalesQueries", () => ({
  useSessionQuery: () => useSessionQuery(),
  useCommissionsQuery: (...args: unknown[]) => useCommissionsQuery(...args),
  usePortalSettingsQuery: () => usePortalSettingsQuery(),
  useAdminSettingsQuery: (enabled: boolean) => useAdminSettingsQuery(enabled)
}));

const listItem = {
  id: "c1",
  leadId: "l1",
  repUserId: "r1",
  amountCents: 40_000,
  bonusCents: 0,
  isPaid: true,
  paidAt: "2026-05-12T00:00:00.000Z",
  paidByAdminId: "a1",
  createdAt: "2026-05-01T00:00:00.000Z",
  lead: {
    id: "l1",
    clientName: "rish1",
    status: "COMMISSION_PAID",
    agreedTotalCents: 799_900,
    project: { deploymentVerifiedAt: "2026-05-01T00:00:00.000Z" }
  },
  rep: { id: "r1", displayName: "Rep" },
  expectedAmountCents: 3_999,
  integrityIssues: [] as string[]
};

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CommissionPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CommissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePortalSettingsQuery.mockReturnValue({
      data: {
        settings: {
          minAgreedTotalCents: 799_900,
          commissionRateBps: 50,
          commissionRounding: "bankers",
          performanceBonusBps: 500,
          performanceBonusAfterCompletedSales: 10,
          advancePaymentShareBps: 5000,
          templatesCatalogUrl: "",
          tutorialLinks: [],
          painPointsByCategory: [],
          paymentShareMethods: []
        }
      },
      isLoading: false
    });
    useAdminSettingsQuery.mockReturnValue({ data: undefined, isLoading: false });
    useCommissionsQuery.mockReturnValue({
      data: {
        items: [listItem],
        total: 1,
        page: 1,
        pageSize: 20,
        summary: { total: 1, siteLive: 1, calculated: 1, paid: 1 }
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });
  });

  it("rep view shows summary bar and deal columns", () => {
    useSessionQuery.mockReturnValue({
      data: { user: { role: "SALES_REP", id: "r1" } }
    });
    renderPage();
    expect(screen.getByRole("heading", { name: "Commission" })).toBeInTheDocument();
    expect(screen.getByText("Payout timing")).toBeInTheDocument();
    expect(screen.getByText("Deal amount")).toBeInTheDocument();
    expect(screen.getByText("rish1")).toBeInTheDocument();
  });

  it("Model B rep sees Payouts title and Completed filter", () => {
    useSessionQuery.mockReturnValue({
      data: { user: { role: "SALES_REP", id: "r1", commissionModel: "MODEL_B" } }
    });
    usePortalSettingsQuery.mockReturnValue({
      data: {
        settings: {
          commissionModel: "MODEL_B",
          minAgreedTotalCents: 799_900,
          commissionRateBps: 50,
          commissionRounding: "bankers",
          performanceBonusBps: 500,
          performanceBonusAfterCompletedSales: 10,
          advancePaymentShareBps: 5000,
          templatesCatalogUrl: "",
          tutorialLinks: [],
          painPointsByCategory: [],
          paymentShareMethods: [],
          milestoneTarget: 5,
          milestoneAmountCents: 1_000_000,
          perDealAfterCents: 200_000
        }
      },
      isLoading: false
    });
    useCommissionsQuery.mockReturnValue({
      data: {
        items: [
          {
            ...listItem,
            amountCents: 200_000,
            expectedAmountCents: null
          }
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        summary: {
          total: 1,
          siteLive: 1,
          calculated: 1,
          paid: 1,
          milestone: {
            deployedCount: 6,
            milestoneTarget: 5,
            paidEarningsCents: 1_200_000,
            nextPayoutHint: "Your next site-live sale earns you ₹2,000.",
            milestoneReady: false,
            milestoneReadyLeadId: null
          }
        }
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: Date.now(),
      refetch: vi.fn()
    });
    renderPage();
    expect(screen.getByRole("heading", { name: "Payouts" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Completed" })).toBeInTheDocument();
    expect(screen.queryByText("Commission rate")).not.toBeInTheDocument();
    expect(screen.getByText("Payout type")).toBeInTheDocument();
    expect(screen.getByText("Your milestone progress")).toBeInTheDocument();
    expect(screen.queryByText(/Earned so far/i)).not.toBeInTheDocument();
  });

  it("admin view shows Commissions title and rep subline", () => {
    useSessionQuery.mockReturnValue({
      data: { user: { role: "ADMIN", id: "a1" } }
    });
    useAdminSettingsQuery.mockReturnValue({
      data: {
        settings: {
          minAgreedTotalCents: 799_900,
          commissionRateBps: 50,
          commissionRounding: "bankers",
          commissionBasis: "AGREED_TOTAL",
          advancePaymentShareBps: 5000,
          templatesCatalogUrl: "",
          tutorialLinks: [],
          painPointsByCategory: [],
          paymentShareMethods: [],
          manualTransitions: [],
          advancePaymentRequiredLeadStatus: "NEW",
          finalPaymentRequiredLeadStatus: "BUILDING",
          advanceVerifyRequiredLeadStatus: "NEW",
          finalVerifyRequiredLeadStatus: "BUILDING",
          terminalNoMutationStatuses: [],
          enforcePaymentQuoteToleranceBps: null,
          exportMaxRows: 5000,
          performanceBonusBps: 0,
          performanceBonusAfterCompletedSales: 3
        }
      },
      isLoading: false
    });
    renderPage();
    expect(screen.getByRole("heading", { name: "Commissions" })).toBeInTheDocument();
    expect(screen.getByText(/Rep: Rep/i)).toBeInTheDocument();
  });
});
