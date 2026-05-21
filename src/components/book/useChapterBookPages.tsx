"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  CHAPTER_BODY_CLASS,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  paginateChapterContent,
  type PageFlipChapter,
} from "./PageFlip";

export function useChapterBookPages(chapter: PageFlipChapter) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<string[]>(() => [chapter.content]);

  useEffect(() => {
    const measure = measureRef.current;
    if (!measure) {
      return;
    }

    const paginate = () => {
      setPages(paginateChapterContent(chapter.content, chapter, measure));
    };

    paginate();
    window.addEventListener("resize", paginate);

    return () => window.removeEventListener("resize", paginate);
  }, [chapter, chapter.content]);

  return { pages, measureRef };
}

export function ChapterBookMeasurer({
  measureRef,
}: {
  measureRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
      className="pointer-events-none fixed -left-[9999px] top-0 flex flex-col overflow-hidden border border-border/70 bg-card px-7 pt-8 pb-3 text-card-foreground opacity-0"
    >
      <div ref={measureRef} className={CHAPTER_BODY_CLASS} />
      <footer className="mt-3 border-t border-border/60 pt-2 text-center font-sans text-xs text-muted-foreground">
        0
      </footer>
    </div>
  );
}
