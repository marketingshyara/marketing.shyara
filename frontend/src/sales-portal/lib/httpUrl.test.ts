import { describe, expect, it } from "vitest";
import { prepareHttpUrlForMutation, tryNormalizeHttpUrl } from "./httpUrl";

describe("tryNormalizeHttpUrl", () => {
  it("prepends https when scheme missing", () => {
    expect(tryNormalizeHttpUrl("example.com")).toBe("https://example.com/");
  });
});

describe("prepareHttpUrlForMutation", () => {
  it("returns null for empty", () => {
    expect(prepareHttpUrlForMutation("")).toBeNull();
  });

  it("throws for invalid", () => {
    expect(() => prepareHttpUrlForMutation("not a url")).toThrow(/valid link/i);
  });
});
