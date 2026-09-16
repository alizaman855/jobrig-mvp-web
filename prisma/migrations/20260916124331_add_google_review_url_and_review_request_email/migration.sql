-- DropIndex
DROP INDEX "ReviewRequest_businessId_jobId_idx";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "googleReviewUrl" TEXT;

-- AlterTable
ALTER TABLE "ReviewRequest" ADD COLUMN     "emailMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequest_jobId_key" ON "ReviewRequest"("jobId");

