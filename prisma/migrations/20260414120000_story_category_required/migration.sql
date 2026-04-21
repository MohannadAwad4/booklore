-- Existing rows may have NULL; fill before NOT NULL + default.
UPDATE "Story"
SET "storyCategory" = 'FICTION'::"StoryCategory"
WHERE "storyCategory" IS NULL;

ALTER TABLE "Story"
ALTER COLUMN "storyCategory" SET DEFAULT 'FICTION'::"StoryCategory";

ALTER TABLE "Story"
ALTER COLUMN "storyCategory" SET NOT NULL;
