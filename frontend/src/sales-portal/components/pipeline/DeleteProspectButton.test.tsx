import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteProspectButton } from "./DeleteProspectButton";

const mutate = vi.fn();

vi.mock("../../hooks/useSalesQueries", () => ({
  useDeleteLeadMutation: () => ({
    mutate,
    isPending: false
  })
}));

describe("DeleteProspectButton", () => {
  it("uses two-step confirmation before deleting", async () => {
    const user = userEvent.setup();
    mutate.mockClear();

    render(
      <DeleteProspectButton leadId="lead-1" clientName="Acme Cafe" variant="listRow" />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Delete this prospect?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Permanently delete prospect?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes, delete permanently" }));
    expect(mutate).toHaveBeenCalledWith("lead-1", expect.any(Object));
  });
});
