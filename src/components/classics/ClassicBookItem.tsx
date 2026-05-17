"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BookCoverPlaceholder } from "@/components/media-placeholders";
import {
  pickCoverUrl,
  type GutendexClassicBook,
} from "@/lib/gutendex";

export type { GutendexClassicBook };

export default function ClassicBookItem({
  book,
}: {
  book: GutendexClassicBook;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverSrc = pickCoverUrl(book.formats);

  async function openClassic() {
    if (loading) return;
    setError(null);
    setLoading(true);
    let succeeded = false;
    try {
      const res = await fetch(
        `/api/classics/gutenberg/${book.id}/import`,
        { method: "POST" },
      );
      const data = (await res.json()) as { storyId?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      if (!data.storyId) {
        setError("Missing story id.");
        return;
      }
      succeeded = true;
      router.push(`/book/${data.storyId}/chapters`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      if (!succeeded) setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-col font-sans">
      <button
        type="button"
        onClick={openClassic}
        disabled={loading}
        aria-busy={loading}
        aria-label={`Open ${book.title}`}
        className="group/cover block w-full min-w-0 cursor-pointer rounded-xl text-left outline-none transition hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait"
      >
        <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/10 dark:ring-white/10">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              className="h-full w-full object-contain object-center"
              sizes="128px"
              loading="lazy"
            />
          ) : (
            <BookCoverPlaceholder className="size-full text-muted-foreground" />
          )}
          {loading ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/85 backdrop-blur-[1px]">
              <Loader2
                className="size-8 shrink-0 animate-spin text-primary"
                aria-hidden
              />
              <span className="sr-only">Importing book…</span>
            </div>
          ) : null}
        </div>
      </button>

      <button
        type="button"
        onClick={openClassic}
        disabled={loading}
        className="mt-0 w-full min-w-0 overflow-hidden rounded-sm pt-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait"
      >
        <h3 className="ui-trending-title w-full min-w-0 group-hover/cover:underline">
          {book.title}
        </h3>
      </button>

      {error ? (
        <p className="mt-1 line-clamp-3 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
