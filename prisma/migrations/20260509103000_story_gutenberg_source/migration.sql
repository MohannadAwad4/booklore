-- CreateEnum
CREATE TYPE "StorySource" AS ENUM ('USER', 'GUTENBERG');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "storySource" "StorySource" NOT NULL DEFAULT 'USER',
ADD COLUMN     "gutenbergId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Story_gutenbergId_key" ON "Story"("gutenbergId");
