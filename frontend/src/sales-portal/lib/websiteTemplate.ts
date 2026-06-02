import type { WebsiteTemplate } from "../types";

/** Portal-only template for bespoke client builds (no catalog sample). */
export const CUSTOM_WEBSITE_TEMPLATE_ID = "wt-custom-website";

export function isCustomWebsiteTemplate(
  template: Pick<WebsiteTemplate, "id" | "categoryId"> | null | undefined
): boolean {
  if (!template) return false;
  return template.categoryId === "custom" || template.id === CUSTOM_WEBSITE_TEMPLATE_ID;
}

export const CUSTOM_WEBSITE_HELPER_COPY =
  "No catalog sample — this is a bespoke build. Add requirements in Lead notes if needed.";
