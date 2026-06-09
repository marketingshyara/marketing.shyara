-- Bloom & Vine florist and Verdant Heights real estate website templates (manifest RET/001, REA/001)

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-florist-bloom-vine-website', 'florist-bloom-vine-website', 'Bloom & Vine Florist Website', 'RET/001', 'retail', 'florist-bloom-vine-website', '/samples/websites/florist-bloom-vine-website/', 150),
  ('wt-realestate-verdant-heights-website', 'realestate-verdant-heights-website', 'Verdant Heights Real Estate Website', 'REA/001', 'real-estate', 'realestate-verdant-heights-website', '/samples/websites/realestate-verdant-heights-website/', 160)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";
