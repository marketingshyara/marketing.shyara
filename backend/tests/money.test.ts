import { describe, expect, it } from "vitest";
import { divideCentsWithRounding } from "../src/lib/money.js";

describe("divideCentsWithRounding", () => {
  it("returns exact quotients without surprise", () => {
    expect(divideCentsWithRounding(20000, 10000, "bankers")).toBe(2);
    expect(divideCentsWithRounding(50_000, 10000, "bankers")).toBe(5);
  });

  it("rounds toward zero with floor mode", () => {
    expect(divideCentsWithRounding(198_000, 10000, "floor")).toBe(19); // 19.8 -> 19
    expect(divideCentsWithRounding(199_000, 10000, "floor")).toBe(19); // 19.9 -> 19
  });

  it("rounds half up with round mode", () => {
    expect(divideCentsWithRounding(5_000, 10000, "round")).toBe(1); // 0.5 -> 1
    expect(divideCentsWithRounding(15_000, 10000, "round")).toBe(2); // 1.5 -> 2
  });

  it("rounds half to even with bankers mode", () => {
    expect(divideCentsWithRounding(5_000, 10000, "bankers")).toBe(0); // 0.5 -> 0 (even)
    expect(divideCentsWithRounding(15_000, 10000, "bankers")).toBe(2); // 1.5 -> 2 (even)
    expect(divideCentsWithRounding(25_000, 10000, "bankers")).toBe(2); // 2.5 -> 2 (even)
    expect(divideCentsWithRounding(35_000, 10000, "bankers")).toBe(4); // 3.5 -> 4 (even)
  });

  it("rounds non-tie remainders to nearest under bankers mode", () => {
    expect(divideCentsWithRounding(198_000, 10000, "bankers")).toBe(20); // 19.8 -> 20
    expect(divideCentsWithRounding(192_000, 10000, "bankers")).toBe(19); // 19.2 -> 19
  });

  it("rejects non-positive denominator", () => {
    expect(() => divideCentsWithRounding(1, 0, "bankers")).toThrow();
    expect(() => divideCentsWithRounding(1, -1, "bankers")).toThrow();
  });
});
