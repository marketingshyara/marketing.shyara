-- Remove RES/001 and RES/002
UPDATE "Lead" SET "websiteTemplateId" = NULL WHERE "websiteTemplateId" IN ('wt-restaurant-classic-website', 'wt-restaurant-botanical-website');
DELETE FROM "WebsiteTemplate" WHERE "id" IN ('wt-restaurant-classic-website', 'wt-restaurant-botanical-website');

-- Update RES/003 and RES/004 to RES/001 and RES/002
UPDATE "WebsiteTemplate" SET "displayCode" = 'RES/001' WHERE "id" = 'wt-restaurant-journey-of-taste-website';
UPDATE "WebsiteTemplate" SET "displayCode" = 'RES/002' WHERE "id" = 'wt-restaurant-fire-town-website';

-- Add new samples
INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-tasteful-tales-art', 'tasteful-tales-art', 'Tasteful Tales Restaurant', 'RES/003', 'restaurants', 'tasteful-tales-art', '/samples/websites/tasteful-tales-art/', 42),
  ('wt-slick-cuts-style', 'slick-cuts-style', 'Slick Cuts Salon', 'SAL/001', 'salons', 'slick-cuts-style', '/samples/websites/slick-cuts-style/', 130),
  ('wt-shine-softly-studio', 'shine-softly-studio', 'Shine Softly Studio', 'SAL/002', 'salons', 'shine-softly-studio', '/samples/websites/shine-softly-studio/', 140),
  ('wt-aura-salon-studio', 'aura-salon-studio', 'Aura Salon Studio', 'SAL/003', 'salons', 'aura-salon-studio', '/samples/websites/aura-salon-studio/', 150)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";
