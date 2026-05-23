import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PipelineProgress, stageIsClickable } from "./PipelineProgress";
import type { PipelineStageView } from "../../types";

const buildDemoStage: PipelineStageView = {
  key: "build_demo",
  title: "Website build & demo link",
  repActor: false,
  adminActor: true,
  state: "pending_admin",
  hint: "Waiting on technical team"
};

describe("stageIsClickable", () => {
  it("allows rep to open build_demo when preview URL exists", () => {
    expect(stageIsClickable(buildDemoStage, "rep", "https://demo.test")).toBe(true);
  });

  it("blocks rep from build_demo when preview URL is missing", () => {
    expect(stageIsClickable(buildDemoStage, "rep", null)).toBe(false);
    expect(stageIsClickable(buildDemoStage, "rep", "   ")).toBe(false);
  });
});

describe("PipelineProgress rep build_demo", () => {
  it("enables build_demo step button when repPreviewUrl is set", async () => {
    const user = userEvent.setup();
    const onStageClick = vi.fn();

    render(
      <PipelineProgress
        stages={[buildDemoStage]}
        actorMode="rep"
        onStageClick={onStageClick}
        repPreviewUrl="https://demo.test"
        compact
      />
    );

    const step = screen.getByRole("button", { name: /Website build & demo link/i });
    expect(step).toBeEnabled();
    await user.click(step);
    expect(onStageClick).toHaveBeenCalledWith("build_demo");
  });
});
