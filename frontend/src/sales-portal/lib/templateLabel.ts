import type { WebsiteTemplate } from "../types";

export function formatTemplateOption(t: Pick<WebsiteTemplate, "displayCode" | "name">): string {
  return `${t.displayCode} — ${t.name}`;
}
