"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageFlip, {
  type NextChapter,
  type PageFlipChapter,
} from "./book/PageFlip";
import { useReaderMode } from "./book/ReaderModeProvider";
import {
  ChapterBookMeasurer,
  useChapterBookPages,
} from "./book/useChapterBookPages";

export default function PublishedChapterDisplay({
  chapter,
  storyId,
  nextChapter,
}: {
  chapter: PageFlipChapter;
  storyId: string;
  nextChapter: NextChapter | null;
}) {
  const { readerMode } = useReaderMode();
  const { pages, measureRef } = useChapterBookPages(chapter);
  const [bookMounted, setBookMounted] = useState(false);

  useEffect(() => {
    if (readerMode === "book") {
      setBookMounted(true);
    }
  }, [readerMode]);

  useEffect(() => {
    const coverUrl = chapter.story.coverUrl?.trim();
    if (!coverUrl) {
      return;
    }

    const img = new Image();
    img.src = coverUrl;
  }, [chapter.story.coverUrl]);

  return (
    <div className="relative bg-background">
      <div className={readerMode === "book" ? "hidden" : undefined}>
        <RegularChapterView
          chapter={chapter}
          storyId={storyId}
          nextChapter={nextChapter}
        />
      </div>

      {bookMounted ? (
        <div
          className={
            readerMode === "book"
              ? undefined
              : "pointer-events-none fixed left-[-9999px] top-0 -z-50 w-full overflow-hidden opacity-0"
          }
        >
          <PageFlip
            chapter={chapter}
            storyId={storyId}
            nextChapter={nextChapter}
            pages={pages}
          />
        </div>
      ) : null}

      <ChapterBookMeasurer measureRef={measureRef} />
    </div>
  );
}

function RegularChapterView({
  chapter,
  storyId,
  nextChapter,
}: {
  chapter: PageFlipChapter;
  storyId: string;
  nextChapter: NextChapter | null;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-background">
      <article className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 pb-16 sm:px-8">
        <header className="mb-8 border-b border-border/60 pb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Chapter {chapter.chapterNumber}
          </p>
          <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {chapter.title}
          </h1>
        </header>

        <div
          className="read-chapter-body prose prose-lg prose-neutral max-w-none space-y-10 font-serif text-foreground dark:prose-invert prose-headings:font-sans prose-headings:scroll-mt-28 prose-p:my-0"
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />

        {nextChapter ? (
          <footer className="mt-12 border-t border-border/60 pt-6">
            <Link
              href={`/book/${storyId}/chapters/${nextChapter.id}`}
              className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              Next: {nextChapter.title}
            </Link>
          </footer>
        ) : null}
      </article>
    </div>
  );
}
