import { describe, expect, it } from "vitest";
import { clampPage } from "../src/lib/pagination.js";

describe("clampPage", () => {
  it("clamps high page to last page", () => {
    expect(clampPage(999, 20, 35)).toBe(2);
  });

  it("returns 1 when total is 0", () => {
    expect(clampPage(5, 20, 0)).toBe(1);
  });

  it("keeps page in range", () => {
    expect(clampPage(1, 20, 100)).toBe(1);
    expect(clampPage(3, 20, 100)).toBe(3);
  });
});
