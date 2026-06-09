import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { SampleCategory, WebsiteSample } from "@/types/samples";

const FALLBACK_CATEGORY: SampleCategory = {
  id: "other",
  name: "Other",
  icon: "LayoutGrid",
};

/** Categories that have at least one sample, in manifest order, with fallbacks for unknown ids. */
export function sampleCategoriesWithSamples(
  categories: SampleCategory[],
  samples: WebsiteSample[]
): SampleCategory[] {
  const sampleCategoryIds = new Set(samples.map((s) => s.category));
  if (sampleCategoryIds.size === 0) return [];

  const byId = new Map(categories.map((c) => [c.id, c]));
  const ordered: SampleCategory[] = [];

  for (const cat of categories) {
    if (sampleCategoryIds.has(cat.id)) {
      ordered.push(cat);
      sampleCategoryIds.delete(cat.id);
    }
  }

  for (const id of sampleCategoryIds) {
    ordered.push(
      byId.get(id) ?? {
        id,
        name: id
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        icon: FALLBACK_CATEGORY.icon,
      }
    );
  }

  return ordered;
}

export function sampleCategoryIcon(name: string): LucideIcon | null {
  const Icon = (LucideIcons as Record<string, LucideIcon | undefined>)[name];
  return Icon ?? null;
}
