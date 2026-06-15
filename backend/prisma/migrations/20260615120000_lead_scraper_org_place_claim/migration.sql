-- Org-wide exclusive place claims: one rep per Google place_id.

DELETE FROM "LeadScraperPlaceView" v1
USING "LeadScraperPlaceView" v2
WHERE v1."placeId" = v2."placeId"
  AND v1."viewedAt" > v2."viewedAt";

ALTER TABLE "LeadScraperPlaceView" DROP CONSTRAINT "LeadScraperPlaceView_pkey";
ALTER TABLE "LeadScraperPlaceView" ADD CONSTRAINT "LeadScraperPlaceView_pkey" PRIMARY KEY ("placeId");
