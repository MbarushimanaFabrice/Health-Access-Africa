-- CreateEnum
CREATE TYPE "HealthInfoStatus" AS ENUM ('draft', 'published');

-- AlterTable
ALTER TABLE "health_info" ADD COLUMN     "status" "HealthInfoStatus" NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false;
