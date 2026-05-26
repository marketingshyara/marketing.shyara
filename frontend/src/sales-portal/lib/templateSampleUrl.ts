import type { WebsiteTemplate } from "../types";

/** Public marketing site path for a template live sample. */
export function templateSamplePreviewUrl(
  template: Pick<WebsiteTemplate, "sampleSlug"> | null | undefined
): string | null {
  const slug = template?.sampleSlug?.trim();
  if (!slug) return null;
  return `/samples/websites/${slug}/`;
}

export function templatePosterUrl(
  template: Pick<WebsiteTemplate, "sampleSlug"> | null | undefined
): string | null {
  const slug = template?.sampleSlug?.trim();
  if (!slug) return null;
  return `/samples/websites/${slug}/poster.jpg`;
}

const CATEGORY_LABELS: Record<string, string> = {
  restaurants: "Restaurants",
  clinics: "Clinics",
  astrology: "Astrology",
  coaching: "Coaching",
  fitness: "Fitness",
  automotive: "Auto / Car Care"
};

export function templateCategoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] ?? categoryId;
}
