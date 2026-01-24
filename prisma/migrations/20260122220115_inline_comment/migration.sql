-- DropIndex
DROP INDEX "Comment_chapterId_createdAt_idx";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "paragraphIndex" INTEGER;

-- CreateIndex
CREATE INDEX "Comment_chapterId_paragraphIndex_createdAt_idx" ON "Comment"("chapterId", "paragraphIndex", "createdAt");
