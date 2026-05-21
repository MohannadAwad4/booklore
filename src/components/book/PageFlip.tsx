"use client";

import HTMLFlipBook from "react-pageflip";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type PageFlipChapter = {
  id: string;
  title: string;
  content: string;
  chapterNumber: number;
  story: {
    title: string;
    coverUrl: string | null;
  };
};

export type NextChapter = {
  id: string;
  title: string;
  chapterNumber: number;
};

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (pageNumber: number) => void;
  };
};

export const CHAPTER_BODY_CLASS =
  "read-chapter-body prose prose-neutral max-w-none flex-1 overflow-hidden font-serif text-[1.05rem] leading-7 dark:prose-invert prose-headings:font-sans prose-p:my-0";
export const PAGE_WIDTH = 500;
export const PAGE_HEIGHT = 760;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function splitHtmlIntoBlocks(content: string) {
  const blocks = content
    .split(/(<\/(?:p|h[1-6]|blockquote|ul|ol|pre|figure|table|div)>)/gi)
    .reduce<string[]>((blocks, piece, index, parts) => {
      if (!piece.trim()) {
        return blocks;
      }

      if (
        piece.match(/^<\/(?:p|h[1-6]|blockquote|ul|ol|pre|figure|table|div)>$/i)
      ) {
        return blocks;
      }

      blocks.push(`${piece}${parts[index + 1] ?? ""}`);
      return blocks;
    }, []);

  return blocks.length > 0 ? blocks : [content];
}

function chapterHeaderHtml(chapter: PageFlipChapter) {
  return `
    <header class="mb-5 border-b border-border/60 pb-4">
      <p class="mb-2 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Chapter ${chapter.chapterNumber}
      </p>
      <h2 class="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
        ${escapeHtml(chapter.title)}
      </h2>
    </header>
  `;
}

function setMeasureHtml(measurer: HTMLDivElement, html: string) {
  measurer.innerHTML = html;
  return measurer.scrollHeight <= measurer.clientHeight + 1;
}

function pageFits(
  measurer: HTMLDivElement,
  html: string,
  chapter: PageFlipChapter
) {
  return setMeasureHtml(measurer, `${chapterHeaderHtml(chapter)}${html}`);
}

function continuationPageFits(measurer: HTMLDivElement, html: string) {
  return setMeasureHtml(measurer, html);
}

function serializeNode(node: ChildNode) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent ?? "");
  }

  if (node instanceof HTMLElement) {
    return node.outerHTML;
  }

  return "";
}

function cloneElementWithHtml(element: HTMLElement, html: string) {
  const clone = element.cloneNode(false) as HTMLElement;
  clone.innerHTML = html;
  return clone.outerHTML;
}

function fitsPageHtml(
  measurer: HTMLDivElement,
  chapter: PageFlipChapter,
  pages: string[],
  page: string,
  html: string
) {
  const candidate = `${page}${html}`;
  return pages.length === 0
    ? pageFits(measurer, candidate, chapter)
    : continuationPageFits(measurer, candidate);
}

function appendTextAcrossPages(
  measurer: HTMLDivElement,
  text: string,
  chapter: PageFlipChapter,
  pages: string[],
  page: string,
  wrapText: (textHtml: string) => string = (textHtml) => textHtml
) {
  const words = text.split(/\s+/).filter(Boolean);
  let chunk = "";

  for (const word of words) {
    const nextChunk = chunk ? `${chunk} ${word}` : word;
    const html = wrapText(escapeHtml(nextChunk));

    if (fitsPageHtml(measurer, chapter, pages, page, html)) {
      chunk = nextChunk;
      continue;
    }

    if (chunk) {
      page += wrapText(escapeHtml(chunk));
      pages.push(page);
      page = "";
      chunk = word;
      continue;
    }

    if (page) {
      pages.push(page);
      page = "";
    }

    chunk = word;
  }

  if (chunk) {
    page += wrapText(escapeHtml(chunk));
  }

  return page;
}

function appendElementAcrossPages(
  measurer: HTMLDivElement,
  element: HTMLElement,
  chapter: PageFlipChapter,
  pages: string[],
  currentPage: string
) {
  let page = currentPage;
  let innerHtml = "";

  for (const child of Array.from(element.childNodes)) {
    const childHtml = serializeNode(child);
    const nextInnerHtml = `${innerHtml}${childHtml}`;
    const nextElementHtml = cloneElementWithHtml(element, nextInnerHtml);

    if (fitsPageHtml(measurer, chapter, pages, page, nextElementHtml)) {
      innerHtml = nextInnerHtml;
      continue;
    }

    if (child.nodeType === Node.TEXT_NODE) {
      if (innerHtml) {
        pages.push(page + cloneElementWithHtml(element, innerHtml));
        page = "";
        innerHtml = "";
      }

      page = appendTextAcrossPages(
        measurer,
        child.textContent ?? "",
        chapter,
        pages,
        page,
        (textHtml) => cloneElementWithHtml(element, textHtml)
      );
      continue;
    }

    if (innerHtml) {
      pages.push(page + cloneElementWithHtml(element, innerHtml));
      page = "";
      innerHtml = "";
    }

    page = appendNodeAcrossPages(measurer, child, chapter, pages, page);
  }

  if (innerHtml) {
    page += cloneElementWithHtml(element, innerHtml);
  }

  return page;
}

function appendNodeAcrossPages(
  measurer: HTMLDivElement,
  node: ChildNode,
  chapter: PageFlipChapter,
  pages: string[],
  currentPage: string
) {
  const nodeHtml = serializeNode(node);

  if (fitsPageHtml(measurer, chapter, pages, currentPage, nodeHtml)) {
    return `${currentPage}${nodeHtml}`;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return appendTextAcrossPages(
      measurer,
      node.textContent ?? "",
      chapter,
      pages,
      currentPage
    );
  }

  if (node instanceof HTMLElement) {
    return appendElementAcrossPages(measurer, node, chapter, pages, currentPage);
  }

  if (currentPage) {
    pages.push(currentPage);
  }

  return nodeHtml;
}

export function paginateChapterContent(
  content: string,
  chapter: PageFlipChapter,
  measurer: HTMLDivElement
) {
  const template = document.createElement("template");
  template.innerHTML = splitHtmlIntoBlocks(content).join("");
  const pages: string[] = [];
  let page = "";

  for (const node of Array.from(template.content.childNodes)) {
    page = appendNodeAcrossPages(measurer, node, chapter, pages, page);
  }

  if (page) {
    pages.push(page);
  }

  return pages.length > 0 ? pages : [content];
}

const ChapterPage = forwardRef<
  HTMLDivElement,
  { children: ReactNode; pageNumber?: number; variant?: "cover" | "content" }
>(function ChapterPage({ children, pageNumber, variant = "content" }, ref) {
  const isCover = variant === "cover";

  return (
    <section
      ref={ref}
      style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
      className={
        isCover
          ? "flex flex-col overflow-hidden border border-border/70 bg-card text-card-foreground shadow-xl"
          : "flex flex-col overflow-hidden border border-border/70 bg-card px-7 py-6 text-card-foreground shadow-xl px-7 pt-10 "
      }
    >
      {isCover ? (
        children
      ) : (
        <>
          <div className={CHAPTER_BODY_CLASS}>{children}</div>
          <footer className="mt-3 border-t border-border/60 pt-2 text-center font-sans text-xs text-muted-foreground">
            {pageNumber}
          </footer>
        </>
      )}
    </section>
  );
});

function CoverPage({ chapter }: { chapter: PageFlipChapter }) {
  const coverSrc = chapter.story.coverUrl?.trim() || null;

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-muted p-8 text-center">
      {coverSrc ? (
        <img
          src={coverSrc}
          alt={`${chapter.story.title} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/70" />
    </div>
  );
}

export default function PageFlip({
  chapter,
  storyId,
  nextChapter,
  pages,
}: {
  chapter: PageFlipChapter;
  storyId: string;
  nextChapter: NextChapter | null;
  pages: string[];
}) {
  const router = useRouter();
  const bookRef = useRef<FlipBookHandle | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageJumpValue, setPageJumpValue] = useState("");
  const totalPages = pages.length + 1;
  const isLastPage = currentPage >= totalPages - 1;
  const displayedJumpValue =
    pageJumpValue || (currentPage === 0 ? "0" : String(currentPage));

  useEffect(() => {
    setCurrentPage(0);
  }, [chapter.id, pages]);

  const handleNext = () => {
    if (isLastPage && nextChapter) {
      router.push(`/book/${storyId}/chapters/${nextChapter.id}`);
      return;
    }

    bookRef.current?.pageFlip().flipNext();
  };

  const handlePageJump = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requestedPage = Number.parseInt(pageJumpValue, 10);
    if (Number.isNaN(requestedPage)) {
      return;
    }

    const clampedPage = Math.min(Math.max(requestedPage, 0), pages.length);
    bookRef.current?.pageFlip().turnToPage(clampedPage);
    setCurrentPage(clampedPage);
    setPageJumpValue("");
  };

  const handlePageJumpBlur = () => {
    setPageJumpValue("");
  };

  return (
    <main className="h-[calc(100dvh-4rem)] overflow-hidden border-t border-border bg-background px-4 py-6 sm:px-6 lg:px-8">
      

      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-4 overflow-hidden">
        <HTMLFlipBook
          ref={bookRef}
          className="mx-auto"
          style={{}}
          startPage={0}
          size="fixed"
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          minWidth={300}
          maxWidth={PAGE_WIDTH}
          minHeight={460}
          maxHeight={PAGE_HEIGHT}
          drawShadow
          flippingTime={700}
          usePortrait
          startZIndex={0}
          autoSize
          maxShadowOpacity={0.25}
          showCover
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          onFlip={(event: { data: number }) => setCurrentPage(event.data)}
        >
          <ChapterPage variant="cover">
            <CoverPage chapter={chapter} />
          </ChapterPage>
          {pages.map((page, index) => (
            <ChapterPage key={index} pageNumber={index + 1}>
              {index === 0 ? (
                <header className="mb-5 border-b border-border/60 pb-4">
                  <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Chapter {chapter.chapterNumber}
                  </p>
                  <h2 className="text-balance font-sans text-3xl font-semibold tracking-tight text-foreground">
                    {chapter.title}
                  </h2>
                </header>
              ) : null}
              <div dangerouslySetInnerHTML={{ __html: page }} />
            </ChapterPage>
          ))}
        </HTMLFlipBook>

        <div className="flex flex-wrap items-center justify-center gap-3 font-sans text-sm text-muted-foreground">
          <button
            type="button"
            className="rounded-full border border-border bg-background px-4 py-2 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 0}
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
          >
            Prev
          </button>
          <form onSubmit={handlePageJump} className="flex items-center gap-2">
            <label htmlFor="page-jump" className="sr-only">
              Jump to page
            </label>
            <input
              id="page-jump"
              type="number"
              min={0}
              max={pages.length}
              value={displayedJumpValue}
              onChange={(event) => setPageJumpValue(event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={handlePageJumpBlur}
              className="h-9 w-14 rounded-full border border-border bg-background px-2 text-center text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <span className="text-muted-foreground">/ {pages.length}</span>
          </form>
          <button
            type="button"
            className="rounded-full border border-border bg-background px-4 py-2 text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLastPage && !nextChapter}
            onClick={handleNext}
          >
            {isLastPage && nextChapter ? `Next: ${nextChapter.title}` : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}
