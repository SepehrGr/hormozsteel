/*
  Warnings:

  - Added the required column `phone` to the `contact_forms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contact_forms" ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
