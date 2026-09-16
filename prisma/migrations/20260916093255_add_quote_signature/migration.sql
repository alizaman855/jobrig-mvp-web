-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "signedAt" TIMESTAMP(3),
ADD COLUMN     "signedByName" TEXT;
