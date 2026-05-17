import type { ChapterReadNavItem } from "@/components/ChapterReadNav";

type ChapterNav = ChapterReadNavItem;

export default function PublishedChapterDisplay({
  chapter,
  
}: {
  chapter: {
    id: string;
    title: string;
    content: string;
    chapterNumber: number;
  };
  
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
          className="read-chapter-body prose prose-lg prose-neutral max-w-none font-serif text-foreground dark:prose-invert prose-headings:font-sans prose-headings:scroll-mt-28 space-y-10 prose-p:my-0"
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </article>
    </div>
  );
}
