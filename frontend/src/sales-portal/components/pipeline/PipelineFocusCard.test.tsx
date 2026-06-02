import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PipelineFocusCard } from "./PipelineFocusCard";
import type { PipelineStageView } from "../../types";

function stage(
  key: PipelineStageView["key"],
  state: PipelineStageView["state"],
  overrides: Partial<PipelineStageView> = {}
): PipelineStageView {
  return {
    key,
    title: key,
    repActor: true,
    adminActor: false,
    state,
    ...overrides
  };
}

describe("PipelineFocusCard", () => {
  it("shows waiting chip and view submission for rep pending admin", () => {
    const onView = vi.fn();
    render(
      <PipelineFocusCard
        stages={[
          stage("lead_capture", "verified"),
          stage("convert_deal", "pending_admin", { repActor: true })
        ]}
        actorMode="rep"
        onPrimaryAction={vi.fn()}
        onViewSubmission={onView}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent(/waiting on admin/i);
    expect(screen.getByRole("button", { name: /view deal/i })).toBeInTheDocument();
  });

  it("calls onPrimaryAction for idle View last step (admin caught up)", async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    render(
      <PipelineFocusCard
        stages={[
          stage("lead_capture", "verified", { adminActor: false }),
          stage("accounts_ready", "verified", {
            repActor: true,
            adminActor: true
          })
        ]}
        actorMode="admin"
        onPrimaryAction={onPrimary}
      />
    );
    await user.click(screen.getByRole("button", { name: /view last step/i }));
    expect(onPrimary).toHaveBeenCalledWith("accounts_ready");
  });

  it("calls onPrimaryAction for admin actionable stage", async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    render(
      <PipelineFocusCard
        stages={[
          stage("whatsapp_group", "pending_admin", {
            repActor: true,
            adminActor: true
          })
        ]}
        actorMode="admin"
        onPrimaryAction={onPrimary}
      />
    );
    await user.click(screen.getByRole("button", { name: /review.*whatsapp/i }));
    expect(onPrimary).toHaveBeenCalledWith("whatsapp_group");
  });
});
