-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "shared_at" TIMESTAMP(3);

-- Consultations completed before this column existed were already visible to
-- patients; backfill them as shared so they don't retroactively disappear.
UPDATE "consultations" SET "shared_at" = COALESCE("endedAt", "updatedAt") WHERE "status" = 'completed';
