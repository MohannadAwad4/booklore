"use client";

import SetChapterStatus, { DeleteChapter } from "@/app/actions/chapter";
import { ChapterType } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { chapterStatus } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { AreYouSure } from "@/components/modals/ToastIndex";
import { toast } from "sonner";
import { useState } from "react";

export default function MyChapterItem({
  chapter,
  userIsAuthor,
}: {
  chapter: ChapterType;
  storyId: string;
  userIsAuthor: boolean | null;
}) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isPublished = chapter.status === chapterStatus.PUBLISHED;

  const href =
    userIsAuthor && !isPublished
      ? `/book/${chapter.storyId}/chapters/${chapter.id}/write`
      : `/book/${chapter.storyId}/chapters/${chapter.id}`;

  async function handlePublish() {
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.set("chapterId", chapter.id);
      formData.set("status", chapterStatus.PUBLISHED);
      await SetChapterStatus(formData);
      toast.success("Chapter published", { position: "top-center" });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        { position: "top-center" },
      );
    } finally {
      setIsPublishing(false);
    }
  }

  function handleDelete() {
    const label = chapter.title || "this chapter";
    const message = isPublished
      ? `Delete “${label}”? This published chapter will be removed permanently.`
      : `Delete “${label}”? This cannot be undone.`;

    AreYouSure({
      message,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const formData = new FormData();
          formData.set("chapterId", chapter.id);
          await DeleteChapter(formData);
          toast.success("Chapter deleted", { position: "top-center" });
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Something went wrong",
            { position: "top-center" },
          );
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <Link
        href={href}
        className="min-w-0 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        {chapter.title}
      </Link>

      {userIsAuthor ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <span
            className={
              isPublished
                ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400"
                : "rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground"
            }
          >
            {isPublished ? "Published" : "Draft"}
          </span>

          {!isPublished ? (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isDeleting}
              className="h-9 rounded-lg bg-button px-3 text-xs font-medium text-button-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPublishing || isDeleting}
            aria-label={`Delete “${chapter.title || "chapter"}”`}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-red-600 transition hover:bg-red-500/15 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300"
          >
            <Trash2 className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
