-- Gym + Car Wash website templates (manifest GYM/001, CAR/001)

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-gym-ironforge-website', 'gym-ironforge-website', 'IronForge Gym Website', 'GYM/001', 'fitness', 'gym-ironforge-website', '/samples/websites/gym-ironforge-website/', 130),
  ('wt-car-wash-auto-care-website', 'car-wash-auto-care-website', 'Car Wash & Auto Care Website', 'CAR/001', 'automotive', 'car-wash-auto-care-website', '/samples/websites/car-wash-auto-care-website/', 140)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";
