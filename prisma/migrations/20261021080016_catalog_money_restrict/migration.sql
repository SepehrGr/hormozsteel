-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropIndex
DROP INDEX "products_categoryId_idx";

-- DropIndex
DROP INDEX "products_subcategory_idx";

-- AlterTable
ALTER TABLE "price_history" ALTER COLUMN "oldPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "newPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "delta" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "previousPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "priceDelta" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "products_categoryId_subcategory_idx" ON "products"("categoryId", "subcategory");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

