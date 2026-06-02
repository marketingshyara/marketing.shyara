import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WebsiteTemplateField } from "./WebsiteTemplateField";
import type { WebsiteTemplate } from "../../types";
import { CUSTOM_WEBSITE_TEMPLATE_ID } from "../../lib/websiteTemplate";

const catalogTemplate: WebsiteTemplate = {
  id: "wt-restaurant-classic-website",
  slug: "restaurant-classic-website",
  name: "Restaurant Website",
  displayCode: "RES/001",
  categoryId: "restaurants",
  sampleSlug: "restaurant-classic-website",
  samplePath: "/samples/websites/restaurant-classic-website/",
  sortOrder: 10
};

const customTemplate: WebsiteTemplate = {
  id: CUSTOM_WEBSITE_TEMPLATE_ID,
  slug: "custom-website",
  name: "Custom Website",
  displayCode: "CUS/001",
  categoryId: "custom",
  sampleSlug: "custom-website",
  samplePath: null,
  sortOrder: 999
};

describe("WebsiteTemplateField", () => {
  it("shows custom helper and no Open sample for Custom Website", () => {
    render(
      <WebsiteTemplateField
        templates={[catalogTemplate, customTemplate]}
        value={CUSTOM_WEBSITE_TEMPLATE_ID}
        mode="selected"
      />
    );

    expect(screen.getByText("Custom Website")).toBeInTheDocument();
    expect(screen.getByText(/No catalog sample/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open sample/i })).not.toBeInTheDocument();
  });

  it("shows Open sample for catalog template when selected", () => {
    render(
      <WebsiteTemplateField
        templates={[catalogTemplate, customTemplate]}
        value={catalogTemplate.id}
        mode="selected"
      />
    );

    expect(screen.getByRole("link", { name: /open sample/i })).toBeInTheDocument();
  });
});
