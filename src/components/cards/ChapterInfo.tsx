"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageWithFallback from "@/components/ImageWithFallback";
import { BookCoverPlaceholder } from "@/components/media-placeholders";
import { toast } from "sonner";
import CoverImageUpload from "@/components/CoverImageUpload";
import {
  UpdateBookTitle,
  UpdateBookDescription,
  UpdateBookCover,
} from "@/app/actions/book/update";

/** Subset of `Story` for the book sidebar on the chapters page (not chapter fields). */
export type StorySidebarMeta = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  authorId: string;
  createdAt: Date | string;
};

function formatCreatedAt(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  );
}

type ChapterInfoProps = {
  userId: string | null;
  story: StorySidebarMeta;
  className?: string;
};

export default function ChapterInfo({
  userId,
  story,
  className = "",
}: ChapterInfoProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const userIsAuthor = !!userId && userId === story.authorId;
  const coverSrc = story.coverUrl?.trim() || null;

  function runAction(
    action: (fd: FormData) => Promise<void>,
    form: HTMLFormElement,
    successMessage: string
  ) {
    const fd = new FormData(form);
    startTransition(async () => {
      try {
        await action(fd);
        toast.success(successMessage);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    });
  }

  return (
    <aside
      className={`w-full shrink-0 space-y-4 rounded-2xl border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm lg:sticky lg:top-20 lg:w-72 ${className}`}
    >
      {userIsAuthor ? (
        <>
          <form
            className="space-y-2"
            encType="multipart/form-data"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(UpdateBookCover, e.currentTarget, "Cover updated");
            }}
          >
            <input type="hidden" name="storyId" value={story.id} />
            <CoverImageUpload
              key={story.coverUrl ?? "none"}
              name="cover"
              label="Cover"
              initialImageUrl={story.coverUrl}
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-button px-3 py-2 text-sm font-medium text-button-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save cover"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground">
            Created {formatCreatedAt(story.createdAt)}
          </p>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(UpdateBookTitle, e.currentTarget, "Title updated");
            }}
          >
            <input type="hidden" name="storyId" value={story.id} />
            <label
              htmlFor={`story-sidebar-title-${story.id}`}
              className="block text-xs font-medium text-muted-foreground"
            >
              Title
            </label>
            <input
              id={`story-sidebar-title-${story.id}`}
              name="title"
              required
              key={story.title}
              defaultValue={story.title}
              disabled={isPending}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-lg font-semibold leading-snug text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-button px-3 py-2 text-sm font-medium text-button-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save title"}
            </button>
          </form>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(
                UpdateBookDescription,
                e.currentTarget,
                "Description updated"
              );
            }}
          >
            <input type="hidden" name="storyId" value={story.id} />
            <label
              htmlFor={`story-sidebar-desc-${story.id}`}
              className="block text-xs font-medium text-muted-foreground"
            >
              Description
            </label>
            <textarea
              id={`story-sidebar-desc-${story.id}`}
              name="description"
              rows={5}
              key={story.description ?? ""}
              defaultValue={story.description ?? ""}
              disabled={isPending}
              placeholder="Short blurb (optional)"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-button px-3 py-2 text-sm font-medium text-button-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save description"}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            <ImageWithFallback
              src={coverSrc}
              fallback={<BookCoverPlaceholder className="size-16 text-muted-foreground" />}
              alt=""
              fill
              quality={88}
              className="object-contain object-center"
              sizes="(max-width: 1024px) 92vw, 360px"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold leading-tight tracking-tight">
              {story.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatCreatedAt(story.createdAt)}
            </p>
          </div>

          {story.description ? (
            <p className="text-sm leading-relaxed text-sidebar-foreground/90">
              {story.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No description.
            </p>
          )}
        </>
      )}
    </aside>
  );
}
