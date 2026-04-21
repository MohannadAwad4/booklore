-- CreateEnum
CREATE TYPE "StoryCategory" AS ENUM ('FICTION', 'NON_FICTION');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "storyCategory" "StoryCategory";
