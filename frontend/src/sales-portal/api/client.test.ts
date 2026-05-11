import { describe, expect, it } from "vitest";
import { parseRetryAfterSeconds } from "./client";

describe("parseRetryAfterSeconds", () => {
  it("returns undefined for empty or invalid", () => {
    expect(parseRetryAfterSeconds(null)).toBeUndefined();
    expect(parseRetryAfterSeconds("")).toBeUndefined();
    expect(parseRetryAfterSeconds("  ")).toBeUndefined();
    expect(parseRetryAfterSeconds("abc")).toBeUndefined();
    expect(parseRetryAfterSeconds("-3")).toBeUndefined();
  });

  it("parses non-negative integers", () => {
    expect(parseRetryAfterSeconds("0")).toBe(0);
    expect(parseRetryAfterSeconds("  90  ")).toBe(90);
    expect(parseRetryAfterSeconds("120")).toBe(120);
  });
});
