-- Fire Town cafe website template (manifest RES/004)

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-restaurant-fire-town-website', 'restaurant-fire-town-website', 'Fire Town Cafe Website', 'RES/004', 'restaurants', 'restaurant-fire-town-website', '/samples/websites/restaurant-fire-town-website/', 45)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";
