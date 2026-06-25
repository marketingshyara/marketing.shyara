-- Playhouse Toys retail website template (manifest RET/002)

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-toy-store-playhouse-website', 'toy-store-playhouse-website', 'Playhouse Toys Website', 'RET/002', 'retail', 'toy-store-playhouse-website', '/samples/websites/toy-store-playhouse-website/', 170)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";
