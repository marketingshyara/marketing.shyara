import { describe, expect, it } from "vitest";
import { buildGoogleSearchVerifyUrl, sourceLabel } from "./leadScraperUtils";

describe("leadScraperUtils", () => {
  it("buildGoogleSearchVerifyUrl encodes name and address", () => {
    expect(buildGoogleSearchVerifyUrl("Acme Clinic", "12 MG Road, Pune, Maharashtra")).toBe(
      `https://www.google.com/search?q=${encodeURIComponent("Acme Clinic 12 MG Road, Pune, Maharashtra")}`
    );
  });

  it("buildGoogleSearchVerifyUrl uses name only when address is missing", () => {
    expect(buildGoogleSearchVerifyUrl("Acme Clinic", null)).toBe(
      `https://www.google.com/search?q=${encodeURIComponent("Acme Clinic")}`
    );
    expect(buildGoogleSearchVerifyUrl("Acme Clinic", "   ")).toBe(
      `https://www.google.com/search?q=${encodeURIComponent("Acme Clinic")}`
    );
  });

  it("sourceLabel maps scraper sources", () => {
    expect(sourceLabel("cache")).toBe("Cached");
    expect(sourceLabel("api_sweep")).toBe("All-types sweep");
    expect(sourceLabel("unknown")).toBe("unknown");
  });
});
