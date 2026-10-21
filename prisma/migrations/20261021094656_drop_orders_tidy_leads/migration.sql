-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropIndex
DROP INDEX "quick_orders_phoneNumber_idx";

-- AlterTable
ALTER TABLE "contact_forms" DROP COLUMN "repliedBy",
DROP COLUMN "reply";

-- AlterTable
ALTER TABLE "quick_orders" ALTER COLUMN "deliveryDate" SET DATA TYPE DATE;

-- DropTable
DROP TABLE "customers";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropEnum
DROP TYPE "OrderStatus";

