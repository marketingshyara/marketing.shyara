/**
 * Canonical website template catalog — keep in sync with
 * frontend/public/samples/websites/manifest.json displayCode fields.
 */

export const TEMPLATE_CATEGORY_PREFIX: Record<string, string> = {
  restaurants: "RES",
  coaching: "COA",
  clinics: "CLI",
  astrology: "AST",
  fitness: "GYM",
  automotive: "CAR",
  custom: "CUS"
};

/** Portal-only template for bespoke client builds (no catalog sample). */
export const CUSTOM_WEBSITE_TEMPLATE_ID = "wt-custom-website";

export function isCustomWebsiteTemplate(
  row: { id?: string; categoryId?: string } | null | undefined
): boolean {
  if (!row) return false;
  return row.categoryId === "custom" || row.id === CUSTOM_WEBSITE_TEMPLATE_ID;
}

export type WebsiteTemplateCatalogEntry = {
  id: string;
  sampleSlug: string;
  slug: string;
  name: string;
  categoryId: string;
  displayCode: string;
  sortOrder: number;
  samplePath: string;
};

const RAW_SAMPLES: { sampleSlug: string; name: string; categoryId: string }[] = [
  { sampleSlug: "restaurant-classic-website", name: "Restaurant Website", categoryId: "restaurants" },
  { sampleSlug: "astrology-consultant-website", name: "Astrologer Website", categoryId: "astrology" },
  { sampleSlug: "restaurant-botanical-website", name: "Botanical Restaurant Website", categoryId: "restaurants" },
  {
    sampleSlug: "restaurant-journey-of-taste-website",
    name: "Journey Of Taste Website",
    categoryId: "restaurants"
  },
  {
    sampleSlug: "restaurant-fire-town-website",
    name: "Fire Town Cafe Website",
    categoryId: "restaurants"
  },
  {
    sampleSlug: "clinic-dental-waiting-room-classic",
    name: "Dental Clinic Website (Classic)",
    categoryId: "clinics"
  },
  {
    sampleSlug: "clinic-multispeciality-waiting-room",
    name: "Multispeciality Clinic Website",
    categoryId: "clinics"
  },
  {
    sampleSlug: "clinic-dental-waiting-room-modern",
    name: "Dental Clinic Website (Modern)",
    categoryId: "clinics"
  },
  { sampleSlug: "clinic-dermatology-waiting-room", name: "Dermatology Clinic Website", categoryId: "clinics" },
  { sampleSlug: "clinic-pathology-waiting-room", name: "Pathology Clinic Website", categoryId: "clinics" },
  {
    sampleSlug: "clinic-physiotherapy-waiting-room",
    name: "Physiotherapy Clinic Website",
    categoryId: "clinics"
  },
  {
    sampleSlug: "clinic-psychological-waiting-room",
    name: "Psychological Clinic Website",
    categoryId: "clinics"
  },
  { sampleSlug: "coaching-classes-website", name: "Coaching Classes Website", categoryId: "coaching" },
  { sampleSlug: "gym-ironforge-website", name: "IronForge Gym Website", categoryId: "fitness" },
  { sampleSlug: "yoga-ananda-website", name: "Ānanda Yoga Studio Website", categoryId: "fitness" },
  {
    sampleSlug: "car-wash-auto-care-website",
    name: "Car Wash & Auto Care Website",
    categoryId: "automotive"
  }
];

function assignDisplayCodes(
  samples: { sampleSlug: string; name: string; categoryId: string }[]
): WebsiteTemplateCatalogEntry[] {
  const counters: Record<string, number> = {};
  return samples.map((s, index) => {
    const prefix = TEMPLATE_CATEGORY_PREFIX[s.categoryId];
    if (!prefix) {
      throw new Error(`Unknown template category: ${s.categoryId}`);
    }
    counters[s.categoryId] = (counters[s.categoryId] ?? 0) + 1;
    const num = String(counters[s.categoryId]).padStart(3, "0");
    const displayCode = `${prefix}/${num}`;
    return {
      id: `wt-${s.sampleSlug}`,
      sampleSlug: s.sampleSlug,
      slug: s.sampleSlug,
      name: s.name,
      categoryId: s.categoryId,
      displayCode,
      sortOrder: (index + 1) * 10,
      samplePath: `/samples/websites/${s.sampleSlug}/`
    };
  });
}

export const WEBSITE_TEMPLATE_CATALOG: WebsiteTemplateCatalogEntry[] = assignDisplayCodes(RAW_SAMPLES);

export const LEGACY_TEMPLATE_IDS = [
  "tmpl_classic_business",
  "tmpl_restaurant",
  "tmpl_portfolio",
  "tmpl_landing",
  "tmpl_other"
] as const;
