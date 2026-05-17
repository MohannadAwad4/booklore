"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChaptersRoute } from "@/app/(story)/book/[storyId]/chapters/chapters-route-context";

export type ChapterReadNavItem = {
  id: string;
  chapterNumber: number;
  title: string;
};

export default function ChapterReadNav({
  chapters,
}: {
  chapters: ChapterReadNavItem[];
}) {
  const router = useRouter();
  const { storyId, chapterId: currentChapterId } = useChaptersRoute();
  if (chapters.length === 0) return null;
  if (!storyId || !currentChapterId) return null;
  const idx = chapters.findIndex((c) => c.id === currentChapterId);
  const hasIdx = idx >= 0;
  const prev = hasIdx && idx > 0 ? chapters[idx - 1] : null;
  const next = hasIdx && idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 sm:gap-2"
      role="navigation"
      aria-label="Chapter navigation"
    >
      {prev ? (
        <Link
          href={`/book/${storyId}/chapters/${prev.id}`}
          aria-label={`Previous: ${prev.title}`}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
        </Link>
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}

      <select
        id="chapter-jump"
        aria-label="Current chapter"
        value={currentChapterId}
        onChange={(e) => {
          const id = e.target.value;
          if (id && id !== currentChapterId) {
            router.push(`/book/${storyId}/chapters/${id}`);
          }
        }}
        className={cn(
          "border-input bg-background text-foreground h-8 min-w-0 max-w-[min(100%,12rem)] flex-1 cursor-pointer rounded-md border px-2 py-1 text-sm shadow-sm sm:max-w-[14rem]",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.chapterNumber}. {c.title}
          </option>
        ))}
      </select>

      {next ? (
        <Link
          href={`/book/${storyId}/chapters/${next.id}`}
          aria-label={`Next: ${next.title}`}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </Link>
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}
    </div>
  );
}
