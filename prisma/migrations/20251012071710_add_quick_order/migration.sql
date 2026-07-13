-- CreateEnum
CREATE TYPE "QuickOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateTable
CREATE TABLE "quick_orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "companyName" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "productSpecs" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'PICKUP',
    "additionalNotes" TEXT,
    "status" "QuickOrderStatus" NOT NULL DEFAULT 'PENDING',
    "productName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quick_orders_status_idx" ON "quick_orders"("status");

-- CreateIndex
CREATE INDEX "quick_orders_createdAt_idx" ON "quick_orders"("createdAt");

-- CreateIndex
CREATE INDEX "quick_orders_phoneNumber_idx" ON "quick_orders"("phoneNumber");
