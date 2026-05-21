import { describe, expect, it } from "vitest";
import { defaultPortalHome, resolvePortalDestination } from "./portalPaths";

describe("portalPaths", () => {
  it("default home by role", () => {
    expect(defaultPortalHome("ADMIN")).toBe("/portal/team");
    expect(defaultPortalHome("SALES_REP")).toBe("/portal/pipeline");
  });

  it("admin cannot return to rep-only routes", () => {
    expect(resolvePortalDestination("ADMIN", "/portal/pipeline")).toBe("/portal/team");
    expect(resolvePortalDestination("ADMIN", "/portal/resources")).toBe("/portal/team");
  });

  it("rep cannot return to admin-only routes", () => {
    expect(resolvePortalDestination("SALES_REP", "/portal/team")).toBe("/portal/pipeline");
    expect(resolvePortalDestination("SALES_REP", "/portal/reviews")).toBe("/portal/pipeline");
  });

  it("preserves valid same-role destinations", () => {
    expect(resolvePortalDestination("ADMIN", "/portal/reviews")).toBe("/portal/reviews");
    expect(resolvePortalDestination("SALES_REP", "/portal/pipeline/abc")).toBe(
      "/portal/pipeline/abc"
    );
  });
});
