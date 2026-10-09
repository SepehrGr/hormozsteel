-- AlterTable: nullable first, so existing rows don't block it
ALTER TABLE "admin_logs" ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT;

-- Backfill from each row's author (hand-written; Prisma can't generate it)
UPDATE "admin_logs" AS l
SET "userName" = u."name", "userEmail" = u."email"
FROM "users" AS u
WHERE u."id" = l."userId";

-- AlterTable: fails if any row is still empty, rather than leaving a gap
ALTER TABLE "admin_logs" ALTER COLUMN "userEmail" SET NOT NULL,
ALTER COLUMN "userName" SET NOT NULL;
