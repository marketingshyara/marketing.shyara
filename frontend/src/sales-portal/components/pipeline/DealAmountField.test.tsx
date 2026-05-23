import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DealAmountField } from "./DealAmountField";

describe("DealAmountField", () => {
  it("renders formatted amount in an output element", () => {
    render(
      <DealAmountField
        id="amt"
        label="Due amount"
        amountCents={399_950}
        hint="From deal"
      />
    );
    const out = screen.getByLabelText("Due amount");
    expect(out.tagName.toLowerCase()).toBe("output");
    expect(out).toHaveTextContent("₹3,999.50");
    expect(screen.getByText("From deal")).toBeInTheDocument();
  });

  it("shows missing status when amount is not set", () => {
    render(<DealAmountField id="amt" label="Advance" amountCents={null} />);
    expect(screen.getByText(/Deal amount is not set/i)).toBeInTheDocument();
  });
});
