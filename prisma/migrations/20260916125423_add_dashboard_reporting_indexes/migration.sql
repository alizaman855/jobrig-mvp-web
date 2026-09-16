-- CreateIndex
CREATE INDEX "Invoice_businessId_status_paidAt_idx" ON "Invoice"("businessId", "status", "paidAt");

-- CreateIndex
CREATE INDEX "Job_businessId_scheduledAt_idx" ON "Job"("businessId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Quote_businessId_status_idx" ON "Quote"("businessId", "status");

-- CreateIndex
CREATE INDEX "ReviewRequest_businessId_status_idx" ON "ReviewRequest"("businessId", "status");
