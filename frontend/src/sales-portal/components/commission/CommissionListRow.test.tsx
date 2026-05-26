import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CommissionListRow } from "./CommissionListRow";
import type { CommissionListItem } from "../../types";

const settings = {
  minAgreedTotalCents: 799_900,
  commissionRateBps: 50,
  commissionRounding: "bankers" as const
};

const row: CommissionListItem = {
  id: "c1",
  leadId: "l1",
  repUserId: "r1",
  amountCents: 400,
  bonusCents: 0,
  isPaid: true,
  paidAt: "2026-05-12T00:00:00.000Z",
  paidByAdminId: "a1",
  createdAt: "2026-05-01T00:00:00.000Z",
  lead: {
    id: "l1",
    clientName: "him2",
    status: "COMMISSION_PAID",
    agreedTotalCents: 100_00,
    project: { deploymentVerifiedAt: "2026-05-01T00:00:00.000Z" }
  },
  rep: { id: "r1", displayName: "Rishabh" },
  expectedAmountCents: null,
  integrityIssues: [
    "Deal amount is below the portal minimum (₹7,999.00).",
    "Commission is below the minimum expected for current portal rate and minimum deal (₹39.99)."
  ]
};

function renderRow(actorMode: "rep" | "admin" = "rep") {
  return render(
    <MemoryRouter>
      <CommissionListRow
        row={row}
        settings={settings}
        actorMode={actorMode}
        rateLabel="0.50%"
      />
    </MemoryRouter>
  );
}

describe("CommissionListRow", () => {
  it("renders deal amount, rate, commission, and paid date", () => {
    renderRow();
    expect(screen.getByText("him2")).toBeInTheDocument();
    expect(screen.getByText("Deal amount")).toBeInTheDocument();
    expect(screen.getByText("Commission rate")).toBeInTheDocument();
    expect(screen.getByText("0.50%")).toBeInTheDocument();
    expect(screen.getByText(/Paid on/i)).toBeInTheDocument();
    expect(screen.getByText("Site live")).toBeInTheDocument();
  });

  it("shows data issue for suspicious payout", () => {
    renderRow();
    expect(screen.getByText(/Does not match portal settings/i)).toBeInTheDocument();
  });

  it("shows rep name for admin", () => {
    renderRow("admin");
    expect(screen.getByText(/Rep: Rishabh/i)).toBeInTheDocument();
  });
});
