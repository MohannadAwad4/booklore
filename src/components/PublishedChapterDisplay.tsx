"use client";

import Link from "next/link";

type ChapterNav = { id: string; chapterNumber: number; title: string };

export default function PublishedChapterDisplay({
  chapter,
  storyId,
  prevChapters,
  nextChapters,
}: {
  chapter: { id: string; title: string; content: string };
  storyId: string;
  prevChapters: ChapterNav[];
  nextChapters: ChapterNav[];
}) {
  const prev = prevChapters[0] ?? null;
  const next = nextChapters[0] ?? null;
  const morePrev = prevChapters.slice(1);
  const moreNext = nextChapters.slice(1);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>
        <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: chapter.content }} />
      </div>
      <nav className="sticky bottom-0 flex flex-col gap-3 px-4 py-4 border-t bg-background max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/book/${storyId}/chapters/${prev.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Previous: {prev.title}
            </Link>
          ) : (
            <span />
          )}
          <Link
            href={`/book/${storyId}/chapters`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
          >
            All chapters
          </Link>
          {next ? (
            <Link
              href={`/book/${storyId}/chapters/${next.id}`}
              className="text-sm font-medium text-primary hover:underline text-right"
            >
              {next.title}: Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
        {(morePrev.length > 0 || moreNext.length > 0) && (
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {morePrev.map((c) => (
                <Link key={c.id} href={`/book/${storyId}/chapters/${c.id}`} className="hover:text-foreground">
                  ← Ch.{c.chapterNumber} {c.title}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end">
              {moreNext.map((c) => (
                <Link key={c.id} href={`/book/${storyId}/chapters/${c.id}`} className="hover:text-foreground">
                  Ch.{c.chapterNumber} {c.title} →
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}