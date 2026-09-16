-- CreateTable
CREATE TABLE "PricingTemplate" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingTemplate_businessId_idx" ON "PricingTemplate"("businessId");

-- AddForeignKey
ALTER TABLE "PricingTemplate" ADD CONSTRAINT "PricingTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
