import { describe, expect, it } from "vitest";
import {
  CUSTOM_WEBSITE_TEMPLATE_ID,
  isCustomWebsiteTemplate
} from "./websiteTemplate";
import { templatePosterUrl, templateSamplePreviewUrl } from "./templateSampleUrl";

describe("websiteTemplate helpers", () => {
  it("identifies custom template", () => {
    expect(
      isCustomWebsiteTemplate({
        id: CUSTOM_WEBSITE_TEMPLATE_ID,
        categoryId: "custom"
      })
    ).toBe(true);
  });
});

describe("templateSampleUrl custom template", () => {
  const custom = {
    id: CUSTOM_WEBSITE_TEMPLATE_ID,
    categoryId: "custom",
    sampleSlug: "custom-website"
  };

  it("returns null preview and poster for custom", () => {
    expect(templateSamplePreviewUrl(custom)).toBeNull();
    expect(templatePosterUrl(custom)).toBeNull();
  });
});
