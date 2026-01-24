-- CreateEnum
CREATE TYPE "chapterStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');

-- DropIndex
DROP INDEX "Chapter_storyId_chapterNumber_idx";

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "status" "chapterStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Chapter_storyId_status_chapterNumber_idx" ON "Chapter"("storyId", "status", "chapterNumber");

-- CreateIndex
CREATE INDEX "Chapter_status_publishedAt_idx" ON "Chapter"("status", "publishedAt");
