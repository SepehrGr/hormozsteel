-- DropIndex
DROP INDEX "public"."price_history_direction_idx";

-- DropIndex
DROP INDEX "public"."price_history_productId_idx";

-- AlterTable
ALTER TABLE "price_history" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "previousPrice";

