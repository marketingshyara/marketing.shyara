-- Website template catalog aligned with /samples/websites/manifest.json

ALTER TABLE "WebsiteTemplate" ADD COLUMN IF NOT EXISTS "displayCode" TEXT;
ALTER TABLE "WebsiteTemplate" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "WebsiteTemplate" ADD COLUMN IF NOT EXISTS "sampleSlug" TEXT;
ALTER TABLE "WebsiteTemplate" ADD COLUMN IF NOT EXISTS "samplePath" TEXT;

UPDATE "Lead"
SET "websiteTemplateId" = NULL
WHERE "websiteTemplateId" IN (
  'tmpl_classic_business',
  'tmpl_restaurant',
  'tmpl_portfolio',
  'tmpl_landing',
  'tmpl_other'
);

DELETE FROM "WebsiteTemplate"
WHERE "id" IN (
  'tmpl_classic_business',
  'tmpl_restaurant',
  'tmpl_portfolio',
  'tmpl_landing',
  'tmpl_other'
);

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "displayCode", "categoryId", "sampleSlug", "samplePath", "sortOrder")
VALUES
  ('wt-restaurant-classic-website', 'restaurant-classic-website', 'Restaurant Website', 'RES/001', 'restaurants', 'restaurant-classic-website', '/samples/websites/restaurant-classic-website/', 10),
  ('wt-astrology-consultant-website', 'astrology-consultant-website', 'Astrologer Website', 'AST/001', 'astrology', 'astrology-consultant-website', '/samples/websites/astrology-consultant-website/', 20),
  ('wt-restaurant-botanical-website', 'restaurant-botanical-website', 'Botanical Restaurant Website', 'RES/002', 'restaurants', 'restaurant-botanical-website', '/samples/websites/restaurant-botanical-website/', 30),
  ('wt-restaurant-journey-of-taste-website', 'restaurant-journey-of-taste-website', 'Journey Of Taste Website', 'RES/003', 'restaurants', 'restaurant-journey-of-taste-website', '/samples/websites/restaurant-journey-of-taste-website/', 40),
  ('wt-clinic-dental-waiting-room-classic', 'clinic-dental-waiting-room-classic', 'Dental Clinic Website (Classic)', 'CLI/001', 'clinics', 'clinic-dental-waiting-room-classic', '/samples/websites/clinic-dental-waiting-room-classic/', 50),
  ('wt-clinic-multispeciality-waiting-room', 'clinic-multispeciality-waiting-room', 'Multispeciality Clinic Website', 'CLI/002', 'clinics', 'clinic-multispeciality-waiting-room', '/samples/websites/clinic-multispeciality-waiting-room/', 60),
  ('wt-clinic-dental-waiting-room-modern', 'clinic-dental-waiting-room-modern', 'Dental Clinic Website (Modern)', 'CLI/003', 'clinics', 'clinic-dental-waiting-room-modern', '/samples/websites/clinic-dental-waiting-room-modern/', 70),
  ('wt-clinic-dermatology-waiting-room', 'clinic-dermatology-waiting-room', 'Dermatology Clinic Website', 'CLI/004', 'clinics', 'clinic-dermatology-waiting-room', '/samples/websites/clinic-dermatology-waiting-room/', 80),
  ('wt-clinic-pathology-waiting-room', 'clinic-pathology-waiting-room', 'Pathology Clinic Website', 'CLI/005', 'clinics', 'clinic-pathology-waiting-room', '/samples/websites/clinic-pathology-waiting-room/', 90),
  ('wt-clinic-physiotherapy-waiting-room', 'clinic-physiotherapy-waiting-room', 'Physiotherapy Clinic Website', 'CLI/006', 'clinics', 'clinic-physiotherapy-waiting-room', '/samples/websites/clinic-physiotherapy-waiting-room/', 100),
  ('wt-clinic-psychological-waiting-room', 'clinic-psychological-waiting-room', 'Psychological Clinic Website', 'CLI/007', 'clinics', 'clinic-psychological-waiting-room', '/samples/websites/clinic-psychological-waiting-room/', 110),
  ('wt-coaching-classes-website', 'coaching-classes-website', 'Coaching Classes Website', 'COA/001', 'coaching', 'coaching-classes-website', '/samples/websites/coaching-classes-website/', 120)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "displayCode" = EXCLUDED."displayCode",
  "categoryId" = EXCLUDED."categoryId",
  "sampleSlug" = EXCLUDED."sampleSlug",
  "samplePath" = EXCLUDED."samplePath",
  "sortOrder" = EXCLUDED."sortOrder";

CREATE UNIQUE INDEX IF NOT EXISTS "WebsiteTemplate_displayCode_key" ON "WebsiteTemplate"("displayCode");
CREATE UNIQUE INDEX IF NOT EXISTS "WebsiteTemplate_sampleSlug_key" ON "WebsiteTemplate"("sampleSlug");

ALTER TABLE "WebsiteTemplate" ALTER COLUMN "displayCode" SET NOT NULL;
ALTER TABLE "WebsiteTemplate" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "WebsiteTemplate" ALTER COLUMN "sampleSlug" SET NOT NULL;
