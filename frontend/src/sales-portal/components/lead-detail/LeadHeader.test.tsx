import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LeadHeader } from "./LeadHeader";

function renderHeader(props: React.ComponentProps<typeof LeadHeader>) {
  return render(
    <MemoryRouter>
      <LeadHeader {...props} />
    </MemoryRouter>
  );
}

describe("LeadHeader", () => {
  it("renders user-friendly status labels", () => {
    renderHeader({ status: "NEW", terminal: false });
    expect(screen.getByText("New Lead")).toBeInTheDocument();
  });

  it("renders mapped status labels", () => {
    renderHeader({ status: "ADVANCE_PAID", terminal: false });
    expect(screen.getByText("Advance Received")).toBeInTheDocument();
  });

  it("announces status changes through aria-live", () => {
    renderHeader({ status: "BUILDING", terminal: false });
    const statusBadge = screen.getByRole("status");
    expect(statusBadge).toHaveAttribute("aria-live", "polite");
  });

  it("shows the (read-only) hint when terminal", () => {
    renderHeader({ status: "COMMISSION_PAID", terminal: true });
    expect(screen.getByText("(read-only)")).toBeInTheDocument();
  });

  it("hides the (read-only) hint when not terminal", () => {
    renderHeader({ status: "NEW", terminal: false });
    expect(screen.queryByText("(read-only)")).not.toBeInTheDocument();
  });
});
