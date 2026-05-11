-- Ensure modern LeadStatus enum values exist.
-- Must run before consolidated drift-heal migration that maps legacy statuses.
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'NEW';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'ADVANCE_PAID';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'BUILDING';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PREVIEW_SENT';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'FINAL_PAID';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'DEPLOYED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'COMMISSION_PAID';
