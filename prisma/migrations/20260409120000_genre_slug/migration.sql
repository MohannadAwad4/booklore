-- AlterTable: add slug (nullable first for existing rows)
ALTER TABLE "Genre" ADD COLUMN "slug" TEXT;

-- Backfill from display name (kebab-case); seed will align canonical slugs on next run
UPDATE "Genre"
SET "slug" = regexp_replace(lower(trim("name")), '\s+', '-', 'g')
WHERE "slug" IS NULL;

CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

ALTER TABLE "Genre" ALTER COLUMN "slug" SET NOT NULL;
