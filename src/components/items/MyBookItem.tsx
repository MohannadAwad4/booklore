import { BookCoverPlaceholder } from "@/components/media-placeholders";
import Link from "next/link";
import type { GenreListItem, StoryType } from "@/lib/types";
import { DeleteBook } from "@/app/actions/book";
import Form from "next/form";
import PublishBookModal from "@/components/modals/PublishBook.modal";
import { Trash2 } from "lucide-react";

export default function MyBookItem({
  story,
  genres,
}: {
  story: StoryType;
  genres: GenreListItem[];
}) {
  const coverSrc = story.coverUrl?.trim() || null;
  const isPublished = story.status === "PUBLISHED";

  return (
    <article className="group flex h-full min-h-[11rem] flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm ring-1 ring-black/[0.03] transition hover:border-border hover:shadow-md dark:ring-white/[0.06]">
      <Link
        href={`/book/${story.id}/chapters`}
        className="flex min-h-0 flex-1 flex-col gap-3 p-4 transition-colors hover:bg-muted/30"
      >
        <div className="flex gap-3">
          <div className="relative aspect-[2/3] w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={`${story.title || "Untitled"} cover`}
                className="size-full object-cover object-center"
                sizes="96px"
              />
            ) : (
              <BookCoverPlaceholder className="size-full text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug tracking-tight text-foreground group-hover:underline">
              {story.title || "Untitled"}
            </h3>
            {story.description ? (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {story.description}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                No description yet.
              </p>
            )}
          </div>
        </div>
      </Link>

      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-3 py-2.5">
        <span
          className={
            isPublished
              ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400"
              : "rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground"
          }
        >
          {isPublished ? "Published" : "Draft"}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {!isPublished && <PublishBookModal story={story} genres={genres} />}
          <Form action={DeleteBook} className="inline">
            <input type="hidden" name="storyId" value={story.id} />
            <button
              type="submit"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-red-600 transition hover:bg-red-500/15 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300"
              aria-label={`Delete “${story.title || "Untitled"}”`}
            >
              <Trash2 className="size-4" strokeWidth={2} />
            </button>
          </Form>
        </div>
      </footer>
    </article>
  );
}
