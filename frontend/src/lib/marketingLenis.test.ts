import { describe, expect, it } from "vitest";
import { isMarketingPath } from "./marketingLenis";

describe("isMarketingPath", () => {
  it("treats portal routes as non-marketing", () => {
    expect(isMarketingPath("/portal")).toBe(false);
    expect(isMarketingPath("/portal/pipeline")).toBe(false);
  });

  it("treats public site routes as marketing", () => {
    expect(isMarketingPath("/")).toBe(true);
    expect(isMarketingPath("/work")).toBe(true);
    expect(isMarketingPath("/services")).toBe(true);
  });
});
