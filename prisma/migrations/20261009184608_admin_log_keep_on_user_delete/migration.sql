-- DropForeignKey
ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_userId_fkey";

-- AlterTable
ALTER TABLE "admin_logs" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

