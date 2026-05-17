import {
  StoryCategory,
  StoryProgress,
  StorySource,
  StoryStatus,
  StoryType,
  CopyrightType,
  chapterStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  fetchGutenbergPlainTextFull,
  fetchGutendexBook,
  gutendexPlainTextUrl,
  pickCoverUrl,
  type GutendexClassicBook,
} from "@/lib/gutendex";
import { getPublicBooksAuthorId } from "@/lib/public-books";
import { splitPlainTextIntoParts } from "@/lib/classics/split-into-parts";
import { plainTextBlocksToHtml } from "@/lib/classics/plain-text-to-html";
import { gutendexLanguagesToStoryLanguage } from "@/lib/classics/map-gutenberg-language";

function descriptionFromGutendex(book: GutendexClassicBook): string | null {
  if (!book.summaries?.length) return null;
  const joined = book.summaries.map((s) => s.trim()).filter(Boolean).join("\n\n");
  return joined.length > 0 ? joined : null;
}

function inferCategory(book: GutendexClassicBook): StoryCategory {
  const blob = [...(book.subjects ?? []), ...(book.bookshelves ?? [])]
    .join(" ")
    .toLowerCase();
  if (
    /\b(bio|essay|speech|economics|cookbook|travel|dictionary|philosoph|science|study|education|essay|documents|christian|christianity|religion|politic|econom|anthrop)\b/i.test(
      blob
    )
  ) {
    return StoryCategory.NON_FICTION;
  }
  return StoryCategory.FICTION;
}

/**
 * Ensures a `Story` (+ published `Chapter` parts) exists for this Gutenberg id.
 * Idempotent per `gutenbergId` unique. Safe under concurrent first requests (P2002 retry).
 */
export async function ensureGutenbergStoryImported(
  gutenbergId: number
): Promise<string> {
  const existing = await prisma.story.findUnique({
    where: { gutenbergId },
    select: { id: true },
  });
  if (existing) return existing.id;

  const meta = await fetchGutendexBook(gutenbergId);
  if (!meta) {
    throw new Error("Classic not found in Gutendex.");
  }

  const textUrl = gutendexPlainTextUrl(meta.formats);
  if (!textUrl) {
    throw new Error(
      "This title has no plain-text URL from Project Gutenberg; it cannot be imported yet."
    );
  }

  const textRes = await fetchGutenbergPlainTextFull(textUrl);
  if (!textRes.ok) {
    throw new Error(`Could not download full text: ${textRes.error}`);
  }

  const partTexts = splitPlainTextIntoParts(textRes.text);
  if (partTexts.length === 0) {
    throw new Error("Downloaded text was empty.");
  }

  const authorId = await getPublicBooksAuthorId();
  const now = new Date();
  const coverUrl = pickCoverUrl(meta.formats);
  const description = descriptionFromGutendex(meta);

  try {
    const story = await prisma.$transaction(async (tx) => {
      const created = await tx.story.create({
        data: {
          authorId,
          storySource: StorySource.GUTENBERG,
          gutenbergId,
          storyType: StoryType.BOOK,
          storyCategory: inferCategory(meta),
          title: meta.title.trim() || `Gutenberg ${gutenbergId}`,
          description,
          status: StoryStatus.PUBLISHED,
          progressStatus: StoryProgress.COMPLETE,
          copyrightType: CopyrightType.PUBLIC_DOMAIN,
          storyLanguage: gutendexLanguagesToStoryLanguage(meta.languages),
          coverUrl,
          publishedAt: now,
          chaptersCount: partTexts.length,
        },
      });

      await tx.chapter.createMany({
        data: partTexts.map((raw, idx) => {
          const paragraphs = raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
          const html = plainTextBlocksToHtml(paragraphs);
          return {
            storyId: created.id,
            authorId,
            chapterNumber: idx + 1,
            title: `Part ${idx + 1}`,
            content: html,
            status: chapterStatus.PUBLISHED,
            publishedAt: now,
          };
        }),
      });

      return created;
    });

    return story.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const again = await prisma.story.findUnique({
        where: { gutenbergId },
        select: { id: true },
      });
      if (again) return again.id;
    }
    throw e;
  }
}
