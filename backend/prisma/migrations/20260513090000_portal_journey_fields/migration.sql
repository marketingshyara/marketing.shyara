-- Website templates (structured catalog for lead selection)
CREATE TABLE "WebsiteTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WebsiteTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebsiteTemplate_slug_key" ON "WebsiteTemplate"("slug");

INSERT INTO "WebsiteTemplate" ("id", "slug", "name", "sortOrder") VALUES
  ('tmpl_classic_business', 'classic-business', 'Classic business', 10),
  ('tmpl_restaurant', 'restaurant', 'Restaurant / menu', 20),
  ('tmpl_portfolio', 'portfolio', 'Portfolio / creative', 30),
  ('tmpl_landing', 'landing', 'Landing / campaign', 40),
  ('tmpl_other', 'other', 'Other / custom brief', 99);

-- Lead journey fields
ALTER TABLE "Lead" ADD COLUMN "agreedTotalCents" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "websiteTemplateId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "contentReceivedAt" TIMESTAMP(3);

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_websiteTemplateId_fkey"
  FOREIGN KEY ("websiteTemplateId") REFERENCES "WebsiteTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Lead_websiteTemplateId_idx" ON "Lead"("websiteTemplateId");

-- Payment provider reference (Razorpay id, etc.) — required on verify VERIFIED in application layer
ALTER TABLE "LeadPayment" ADD COLUMN "externalReference" TEXT;

-- Project delivery / deployment verification
ALTER TABLE "Project" ADD COLUMN "previewUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN "deployedUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN "deploymentSubmittedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "deploymentVerifiedAt" TIMESTAMP(3);
