import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PortalSegmentedNav } from "./PortalSegmentedNav";

describe("PortalSegmentedNav", () => {
  it("marks active segment from pathname", () => {
    render(
      <MemoryRouter initialEntries={["/portal/reviews"]}>
        <PortalSegmentedNav
          segments={[
            { to: "/portal/reviews", label: "Reviews", badge: 3 },
            { to: "/portal/payments", label: "Payments" }
          ]}
        />
      </MemoryRouter>
    );
    const reviews = screen.getByRole("link", { name: /reviews/i });
    expect(reviews).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
