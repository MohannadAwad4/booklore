-- Create StoryProgress enum and column; map old StoryStatus values, then narrow StoryStatus to DRAFT | PUBLISHED.

CREATE TYPE "StoryProgress" AS ENUM ('ONGOING', 'HIATUS', 'COMPLETE');

ALTER TABLE "Story" ADD COLUMN "progressStatus" "StoryProgress" NOT NULL DEFAULT 'ONGOING';

UPDATE "Story" SET "progressStatus" = 'HIATUS' WHERE "status"::text = 'HIATUS';
UPDATE "Story" SET "progressStatus" = 'COMPLETE' WHERE "status"::text = 'COMPLETE';

CREATE TYPE "StoryStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Story" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Story" ALTER COLUMN "status" TYPE "StoryStatus_new" USING (
  CASE "status"::text
    WHEN 'DRAFT' THEN 'DRAFT'::"StoryStatus_new"
    WHEN 'INCOMPLETE' THEN 'DRAFT'::"StoryStatus_new"
    WHEN 'PUBLISHED' THEN 'PUBLISHED'::"StoryStatus_new"
    WHEN 'HIATUS' THEN 'PUBLISHED'::"StoryStatus_new"
    WHEN 'COMPLETE' THEN 'PUBLISHED'::"StoryStatus_new"
    ELSE 'DRAFT'::"StoryStatus_new"
  END
);

DROP TYPE "StoryStatus";
ALTER TYPE "StoryStatus_new" RENAME TO "StoryStatus";
ALTER TABLE "Story" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"StoryStatus";
