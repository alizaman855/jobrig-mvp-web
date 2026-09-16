-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'EN_ROUTE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "serviceZone" TEXT;
