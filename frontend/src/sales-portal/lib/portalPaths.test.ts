import { describe, expect, it } from "vitest";
import {
  defaultPortalHome,
  resolvePortalDestination,
  resolvePortalDestinationAfterLogin
} from "./portalPaths";

describe("portalPaths", () => {
  it("default home by role", () => {
    expect(defaultPortalHome("ADMIN")).toBe("/portal/team");
    expect(defaultPortalHome("SALES_REP")).toBe("/portal/pipeline");
  });

  it("admin cannot return to rep-only routes", () => {
    expect(resolvePortalDestination("ADMIN", "/portal/pipeline")).toBe("/portal/team");
    expect(resolvePortalDestination("ADMIN", "/portal/resources")).toBe("/portal/team");
  });

  it("admin and rep can use shared commission route", () => {
    expect(resolvePortalDestination("ADMIN", "/portal/commission")).toBe("/portal/commission");
    expect(resolvePortalDestination("SALES_REP", "/portal/commission")).toBe("/portal/commission");
  });

  it("rep cannot return to admin-only routes", () => {
    expect(resolvePortalDestination("SALES_REP", "/portal/team")).toBe("/portal/pipeline");
    expect(resolvePortalDestination("SALES_REP", "/portal/reviews")).toBe("/portal/pipeline");
    expect(resolvePortalDestination("SALES_REP", "/portal/payments")).toBe("/portal/pipeline");
    expect(resolvePortalDestination("SALES_REP", "/portal/activity")).toBe("/portal/pipeline");
  });

  it("preserves valid same-role destinations", () => {
    expect(resolvePortalDestination("ADMIN", "/portal/reviews")).toBe("/portal/reviews");
    expect(resolvePortalDestination("ADMIN", "/portal/payments")).toBe("/portal/payments");
    expect(resolvePortalDestination("ADMIN", "/portal/activity")).toBe("/portal/activity");
    expect(resolvePortalDestination("SALES_REP", "/portal/pipeline/abc")).toBe(
      "/portal/pipeline/abc"
    );
    expect(resolvePortalDestination("SALES_REP", "/portal/commission")).toBe("/portal/commission");
  });

  describe("resolvePortalDestinationAfterLogin", () => {
    it("sends admin with pending work to reviews once per session", () => {
      sessionStorage.clear();
      expect(
        resolvePortalDestinationAfterLogin("ADMIN", "/portal/team", 3)
      ).toBe("/portal/reviews");
      expect(
        resolvePortalDestinationAfterLogin("ADMIN", "/portal/team", 3)
      ).toBe("/portal/team");
    });

    it("does not redirect rep or admin without pending items", () => {
      sessionStorage.clear();
      expect(
        resolvePortalDestinationAfterLogin("SALES_REP", "/portal/pipeline", 5)
      ).toBe("/portal/pipeline");
      expect(resolvePortalDestinationAfterLogin("ADMIN", "/portal/team", 0)).toBe(
        "/portal/team"
      );
    });

    it("respects explicit admin destination over reviews landing", () => {
      sessionStorage.clear();
      expect(
        resolvePortalDestinationAfterLogin("ADMIN", "/portal/payments", 2)
      ).toBe("/portal/payments");
    });
  });
});
