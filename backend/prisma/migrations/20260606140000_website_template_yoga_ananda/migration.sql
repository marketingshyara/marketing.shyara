-- Ānanda yoga studio website template (manifest GYM/002)

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-yoga-ananda-website', 'yoga-ananda-website', 'Ānanda Yoga Studio Website', 'GYM/002', 'fitness', 'yoga-ananda-website', '/samples/websites/yoga-ananda-website/', 140)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";
