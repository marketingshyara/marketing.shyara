import { describe, it, expect, vi, afterEach } from "vitest";
import { shouldUseCustomCursor } from "./shouldUseCustomCursor";

function mockMatchMedia(matches: Record<string, boolean>) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: matches[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

describe("shouldUseCustomCursor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when reduced motion is preferred", () => {
    mockMatchMedia({
      "(prefers-reduced-motion: reduce)": true,
      "(pointer: fine)": true,
      "(hover: hover)": true,
    });
    expect(shouldUseCustomCursor()).toBe(false);
  });

  it("returns false when pointer is not fine (touch-first)", () => {
    mockMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(pointer: fine)": false,
      "(hover: hover)": false,
    });
    expect(shouldUseCustomCursor()).toBe(false);
  });

  it("returns true for mouse/trackpad desktop setups", () => {
    mockMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(pointer: fine)": true,
      "(hover: hover)": true,
    });
    expect(shouldUseCustomCursor()).toBe(true);
  });
});
