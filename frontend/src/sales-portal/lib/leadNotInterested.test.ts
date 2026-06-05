import { describe, expect, it } from "vitest";
import { canMarkNotInterested } from "./leadNotInterested";

describe("canMarkNotInterested", () => {
  it("allows unconverted prospect with no verified payments or project", () => {
    expect(
      canMarkNotInterested({
        convertedAt: null,
        notInterestedAt: null,
        status: "NEW",
        payments: [],
        project: null
      })
    ).toBe(true);
  });

  it("rejects already archived prospects", () => {
    expect(
      canMarkNotInterested({
        convertedAt: null,
        notInterestedAt: "2026-06-04T00:00:00.000Z",
        status: "NEW",
        payments: [],
        project: null
      })
    ).toBe(false);
  });

  it("rejects converted clients", () => {
    expect(
      canMarkNotInterested({
        convertedAt: "2026-01-01T00:00:00.000Z",
        status: "BUILDING",
        payments: [],
        project: null
      })
    ).toBe(false);
  });

  it("rejects when a payment is verified", () => {
    expect(
      canMarkNotInterested({
        convertedAt: null,
        status: "NEW",
        payments: [{ verificationStatus: "VERIFIED" }],
        project: null
      })
    ).toBe(false);
  });
});
