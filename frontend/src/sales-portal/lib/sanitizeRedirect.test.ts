import { describe, expect, it } from "vitest";
import {
  getSafePortalReturnPath,
  normalizePortalReturnCandidate,
  sanitizePortalRedirectPath
} from "./sanitizeRedirect";

describe("normalizePortalReturnCandidate", () => {
  it("rejects paths with control characters", () => {
    expect(normalizePortalReturnCandidate("/portal/leads\nhttps://evil.test")).toBeNull();
    expect(normalizePortalReturnCandidate("/portal/leads\x00x")).toBeNull();
  });

  it("allows portal paths with query string", () => {
    expect(normalizePortalReturnCandidate("/portal/leads?status=NEW&page=2")).toBe(
      "/portal/leads?status=NEW&page=2"
    );
  });

  it("rejects overlong strings", () => {
    expect(normalizePortalReturnCandidate("/portal/" + "a".repeat(5000))).toBeNull();
  });

  it("allows normal portal paths", () => {
    expect(normalizePortalReturnCandidate("/portal/leads")).toBe("/portal/leads");
    expect(normalizePortalReturnCandidate("/portal/settings")).toBe("/portal/settings");
  });
});

describe("getSafePortalReturnPath", () => {
  it("prefers first valid candidate", () => {
    expect(getSafePortalReturnPath("/portal/leads", "/portal/approvals", "/portal/leads")).toBe(
      "/portal/approvals"
    );
  });

  it("skips invalid then uses next", () => {
    expect(getSafePortalReturnPath("/portal/leads", "https://evil", "/portal/projects")).toBe(
      "/portal/projects"
    );
  });
});

describe("sanitizePortalRedirectPath", () => {
  it("falls back when invalid", () => {
    expect(sanitizePortalRedirectPath("https://evil")).toBe("/portal/leads");
  });
});
