import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkNotInterestedButton } from "./MarkNotInterestedButton";

vi.mock("../../hooks/useSalesQueries", () => ({
  useMarkNotInterestedMutation: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

describe("MarkNotInterestedButton", () => {
  it("explains restore path in confirm dialog", async () => {
    const user = userEvent.setup();
    render(
      <MarkNotInterestedButton leadId="lead-1" clientName="Acme Cafe" variant="listRow" />
    );

    await user.click(screen.getByRole("button", { name: /Not interested/i }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(
      screen.getByText(/restore them anytime from Not interested/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Note \(optional\)/i)).toBeInTheDocument();
  });
});
