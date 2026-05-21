import { describe, expect, it } from "vitest";
import {
  getSafePortalReturnPath,
  normalizePortalReturnCandidate,
  sanitizePortalRedirectPath
} from "./sanitizeRedirect";

describe("normalizePortalReturnCandidate", () => {
  it("rejects paths with control characters", () => {
    expect(normalizePortalReturnCandidate("/portal/pipeline\nhttps://evil.test")).toBeNull();
    expect(normalizePortalReturnCandidate("/portal/pipeline\x00x")).toBeNull();
  });

  it("allows portal paths with query string", () => {
    expect(normalizePortalReturnCandidate("/portal/pipeline?view=clients&page=2")).toBe(
      "/portal/pipeline?view=clients&page=2"
    );
  });

  it("rejects overlong strings", () => {
    expect(normalizePortalReturnCandidate("/portal/" + "a".repeat(5000))).toBeNull();
  });

  it("allows normal portal paths", () => {
    expect(normalizePortalReturnCandidate("/portal/pipeline")).toBe("/portal/pipeline");
    expect(normalizePortalReturnCandidate("/portal/settings")).toBe("/portal/settings");
  });
});

describe("getSafePortalReturnPath", () => {
  it("prefers first valid candidate", () => {
    expect(getSafePortalReturnPath("/portal/pipeline", "/portal/reviews", "/portal/pipeline")).toBe(
      "/portal/reviews"
    );
  });

  it("skips invalid then uses next", () => {
    expect(getSafePortalReturnPath("/portal/pipeline", "https://evil", "/portal/pipeline")).toBe(
      "/portal/pipeline"
    );
  });
});

describe("sanitizePortalRedirectPath", () => {
  it("falls back when invalid", () => {
    expect(sanitizePortalRedirectPath("https://evil")).toBe("/portal/pipeline");
  });
});
