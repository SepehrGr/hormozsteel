-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropIndex
DROP INDEX "admin_logs_action_idx";

-- DropIndex
DROP INDEX "admin_logs_resourceType_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified",
DROP COLUMN "image";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "verification_tokens";

