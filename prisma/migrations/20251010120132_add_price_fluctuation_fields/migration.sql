/*
  Warnings:

  - You are about to drop the column `date` on the `price_history` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `price_history` table. All the data in the column will be lost.
  - Added the required column `changeAmount` to the `price_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changeType` to the `price_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newPrice` to the `price_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldPrice` to the `price_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."price_history_date_idx";

-- AlterTable
ALTER TABLE "price_history" DROP COLUMN "date",
DROP COLUMN "price",
ADD COLUMN     "changeAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "changeType" TEXT NOT NULL,
ADD COLUMN     "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "newPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "oldPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "changeAmount" DOUBLE PRECISION,
ADD COLUMN     "changeType" TEXT DEFAULT 'stable',
ADD COLUMN     "lastPriceChange" TIMESTAMP(3),
ADD COLUMN     "previousPrice" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "price_history_changedAt_idx" ON "price_history"("changedAt");

-- CreateIndex
CREATE INDEX "price_history_changeType_idx" ON "price_history"("changeType");
