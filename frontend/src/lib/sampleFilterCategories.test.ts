import { describe, expect, it } from "vitest";
import { sampleCategoriesWithSamples, sampleCategoryIcon } from "./sampleFilterCategories";
import type { SampleCategory, WebsiteSample } from "@/types/samples";

const categories: SampleCategory[] = [
  { id: "restaurants", name: "Restaurants", icon: "UtensilsCrossed" },
  { id: "retail", name: "Retail & Florists", icon: "Flower2" },
  { id: "real-estate", name: "Real Estate", icon: "Building2" },
];

const samples: WebsiteSample[] = [
  {
    id: "a",
    displayCode: "RES/001",
    name: "A",
    description: "",
    folder: "a",
    file: "index.html",
    category: "restaurants",
  },
  {
    id: "b",
    displayCode: "RET/001",
    name: "B",
    description: "",
    folder: "b",
    file: "index.html",
    category: "retail",
  },
];

describe("sampleCategoriesWithSamples", () => {
  it("returns only categories that have samples, in manifest order", () => {
    expect(sampleCategoriesWithSamples(categories, samples)).toEqual([
      categories[0],
      categories[1],
    ]);
  });

  it("adds fallback metadata for sample categories missing from manifest", () => {
    const withUnknown: WebsiteSample[] = [
      ...samples,
      {
        id: "c",
        displayCode: "CUS/001",
        name: "C",
        description: "",
        folder: "c",
        file: "index.html",
        category: "custom-builds",
      },
    ];

    expect(sampleCategoriesWithSamples(categories, withUnknown)).toEqual([
      categories[0],
      categories[1],
      {
        id: "custom-builds",
        name: "Custom Builds",
        icon: "LayoutGrid",
      },
    ]);
  });
});

describe("sampleCategoryIcon", () => {
  it("resolves lucide icons by manifest name", () => {
    expect(sampleCategoryIcon("Flower2")).toBeTruthy();
    expect(sampleCategoryIcon("NotARealIcon")).toBeNull();
  });
});
