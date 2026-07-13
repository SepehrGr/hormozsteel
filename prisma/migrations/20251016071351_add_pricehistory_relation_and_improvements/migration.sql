-- Clean up orphan price_history records (records that reference non-existent products)
DELETE FROM "price_history" 
WHERE "productId" NOT IN (SELECT "id" FROM "products");

-- CreateIndex
CREATE INDEX "price_history_productId_changedAt_idx" ON "price_history"("productId", "changedAt" DESC);

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
