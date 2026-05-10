import { describe, expect, it } from "vitest";
import { sanitizePortalRedirectPath } from "./sanitizeRedirect";

describe("sanitizePortalRedirectPath", () => {
  it("rejects paths with control characters", () => {
    expect(sanitizePortalRedirectPath("/portal/leads\nhttps://evil.test")).toBe("/portal/leads");
    expect(sanitizePortalRedirectPath("/portal/leads\x00x")).toBe("/portal/leads");
  });

  it("allows normal portal paths", () => {
    expect(sanitizePortalRedirectPath("/portal/leads")).toBe("/portal/leads");
    expect(sanitizePortalRedirectPath("/portal/settings")).toBe("/portal/settings");
  });
});
