import { describe, expect, it, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { toastIfStageBlocked } from "./pipelineStageGuard";
import type { PipelineStageView } from "../types";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() }
}));

describe("toastIfStageBlocked", () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it("shows blockedReason when stage is locked", () => {
    const stages: PipelineStageView[] = [
      {
        key: "repo_transfer",
        title: "Repo",
        repActor: false,
        adminActor: true,
        state: "locked",
        blockedReason: "Verify due payment first."
      }
    ];
    expect(toastIfStageBlocked(stages, "repo_transfer")).toBe(true);
    expect(toast.error).toHaveBeenCalledWith("Verify due payment first.");
  });

  it("shows fallback when locked without blockedReason", () => {
    const stages: PipelineStageView[] = [
      {
        key: "accounts_ready",
        title: "Accounts",
        repActor: true,
        adminActor: true,
        state: "locked"
      }
    ];
    expect(toastIfStageBlocked(stages, "accounts_ready")).toBe(true);
    expect(toast.error).toHaveBeenCalledWith("Complete earlier steps first.");
  });

  it("returns false when rep verified stage is view-only", () => {
    const stages: PipelineStageView[] = [
      {
        key: "whatsapp_group",
        title: "WhatsApp",
        repActor: true,
        adminActor: false,
        state: "verified",
        hint: "Locked after admin approval."
      }
    ];
    expect(toastIfStageBlocked(stages, "whatsapp_group")).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("returns false when stage is actionable", () => {
    const stages: PipelineStageView[] = [
      {
        key: "whatsapp_group",
        title: "WhatsApp",
        repActor: true,
        adminActor: true,
        state: "actionable"
      }
    ];
    expect(toastIfStageBlocked(stages, "whatsapp_group")).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
