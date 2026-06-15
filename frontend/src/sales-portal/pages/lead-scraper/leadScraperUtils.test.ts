import { describe, expect, it } from "vitest";
import { sourceLabel } from "./leadScraperUtils";

describe("leadScraperUtils", () => {
  it("sourceLabel maps scraper sources", () => {
    expect(sourceLabel("cache")).toBe("Cached");
    expect(sourceLabel("api_sweep")).toBe("All-types sweep");
    expect(sourceLabel("unknown")).toBe("unknown");
  });
});
