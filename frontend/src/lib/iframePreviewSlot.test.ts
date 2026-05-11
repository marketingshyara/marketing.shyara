import { describe, it, expect, afterEach } from "vitest";
import {
  acquireIframePreviewSlot,
  releaseIframePreviewSlot,
  getIframePreviewSlotMetrics,
  __resetIframePreviewSlotForTests,
} from "./iframePreviewSlot";

describe("iframePreviewSlot", () => {
  afterEach(() => {
    __resetIframePreviewSlotForTests();
  });

  it("allows at most 3 concurrent holders until release", async () => {
    await acquireIframePreviewSlot();
    await acquireIframePreviewSlot();
    await acquireIframePreviewSlot();

    expect(getIframePreviewSlotMetrics()).toEqual({ active: 3, queued: 0 });

    const fourth = acquireIframePreviewSlot();
    expect(getIframePreviewSlotMetrics().queued).toBe(1);

    releaseIframePreviewSlot();
    await fourth;

    expect(getIframePreviewSlotMetrics().active).toBe(3);
    expect(getIframePreviewSlotMetrics().queued).toBe(0);
  });
});
