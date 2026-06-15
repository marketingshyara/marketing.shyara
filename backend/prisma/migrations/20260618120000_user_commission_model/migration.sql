-- CreateEnum
CREATE TYPE "CommissionModel" AS ENUM ('MODEL_A', 'MODEL_B');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "commissionModel" "CommissionModel";

-- Default existing sales reps to Model A (preserves current percentage behavior)
UPDATE "User" SET "commissionModel" = 'MODEL_A' WHERE "role" = 'SALES_REP';
