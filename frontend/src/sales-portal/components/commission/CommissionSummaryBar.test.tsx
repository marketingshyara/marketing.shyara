import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommissionSummaryBar } from "./CommissionSummaryBar";

describe("CommissionSummaryBar", () => {
  it("shows four columns including payout timing with visible value", () => {
    render(
      <CommissionSummaryBar
        summary={{ total: 2, siteLive: 2, calculated: 2, paid: 2 }}
      />
    );

    expect(screen.getByText("Site live")).toBeInTheDocument();
    expect(screen.getByText("Calculated")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Payout timing")).toBeInTheDocument();
    expect(screen.getByText("3–5 business days")).toBeInTheDocument();
  });
});
