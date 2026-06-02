import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TwoStepDestructiveDialog } from "./TwoStepDestructiveDialog";
import { Button } from "@/components/ui/button";

describe("TwoStepDestructiveDialog", () => {
  it("requires two steps before calling onConfirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <TwoStepDestructiveDialog
        trigger={<Button type="button">Delete</Button>}
        step1={{
          title: "Delete item?",
          description: "First warning."
        }}
        step2={{
          title: "Confirm deletion?",
          description: "Final warning."
        }}
        confirmLabel="Yes, delete"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/Final confirmation/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("resets to step one when dialog closes", async () => {
    const user = userEvent.setup();

    render(
      <TwoStepDestructiveDialog
        trigger={<Button type="button">Remove</Button>}
        step1={{ title: "Remove user?", description: "Step one." }}
        step2={{ title: "Confirm removal?", description: "Step two." }}
        confirmLabel="Yes, remove"
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/Final confirmation/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });
});
