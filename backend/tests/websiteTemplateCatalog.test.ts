import { describe, expect, it } from "vitest";
import {
  CUSTOM_WEBSITE_TEMPLATE_ID,
  isCustomWebsiteTemplate
} from "../src/data/websiteTemplateCatalog.js";

describe("custom website template catalog", () => {
  it("exports stable custom template id", () => {
    expect(CUSTOM_WEBSITE_TEMPLATE_ID).toBe("wt-custom-website");
  });

  it("detects custom template by categoryId", () => {
    expect(isCustomWebsiteTemplate({ categoryId: "custom" })).toBe(true);
    expect(isCustomWebsiteTemplate({ categoryId: "restaurants" })).toBe(false);
  });

  it("detects custom template by id", () => {
    expect(isCustomWebsiteTemplate({ id: CUSTOM_WEBSITE_TEMPLATE_ID })).toBe(true);
  });
});
