import Link from "next/link";

type ChapterNav = { id: string; chapterNumber: number; title: string };

export default function PublishedChapterDisplay({
  chapter,
  storyId,
  chapters,
}: {
  chapter: { id: string; title: string; content: string };
  storyId: string;
  chapters: ChapterNav[];
}) {
  const idx = chapters.findIndex((c) => c.id === chapter.id);
  const hasIdx = idx >= 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </div>
      <nav className="sticky bottom-0 flex flex-col gap-3 px-4 py-4 border-t bg-background max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4">
          {hasIdx && idx > 0 ? (
            <Link
              href={`/book/${storyId}/chapters/${chapters[idx - 1].id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Previous: {chapters[idx - 1].title}
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
          {hasIdx && idx < chapters.length - 1 ? (
            <Link
              href={`/book/${storyId}/chapters/${chapters[idx + 1].id}`}
              className="text-sm font-medium text-primary hover:underline text-right"
            >
              {chapters[idx + 1].title}: Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
        {hasIdx && (idx > 1 || idx < chapters.length - 2) ? (
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {idx > 1
                ? chapters
                    .slice(0, idx - 1)
                    .reverse()
                    .map((c) => (
                      <Link
                        key={c.id}
                        href={`/book/${storyId}/chapters/${c.id}`}
                        className="hover:text-foreground"
                      >
                        ← Ch.{c.chapterNumber} {c.title}
                      </Link>
                    ))
                : null}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end">
              {idx < chapters.length - 2
                ? chapters.slice(idx + 2).map((c) => (
                    <Link
                      key={c.id}
                      href={`/book/${storyId}/chapters/${c.id}`}
                      className="hover:text-foreground"
                    >
                      Ch.{c.chapterNumber} {c.title} →
                    </Link>
                  ))
                : null}
            </div>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
