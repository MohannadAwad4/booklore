"use client";

import SetChapterStatus from "@/app/actions/chapter";
import { ChapterType } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { chapterStatus, StoryStatus } from "@prisma/client";
import { toast } from "sonner";
import { useState } from "react";

export default function MyChapterItem({
  chapter,
  storyId,
  userIsAuthor,
}: {
  chapter: ChapterType;
  storyId: string;
  userIsAuthor: boolean | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(chapter.status);

  async function handleStatusSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      await SetChapterStatus(formData);
      toast.success("Chapter status updated", {
        position: "top-center",
      });
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        {
          position: "top-center",
        }
      );
      setStatus(chapter.status);
    }
  }

  const href =
    userIsAuthor && chapter.status === chapterStatus.DRAFT
      ? `/book/${chapter.storyId}/chapters/${chapter.id}/write`
      : `/book/${chapter.storyId}/chapters/${chapter.id}`;

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <Link
        href={href}
        className="min-w-0 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        {chapter.title}
      </Link>
      {userIsAuthor ? (
        <form
          onSubmit={handleStatusSubmit}
          className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end"
        >
          <input type="hidden" name="chapterId" value={chapter.id} />
          <select
            name="status"
            defaultValue={status}
            onChange={(e) => setStatus(e.target.value as StoryStatus)}
            className="border-input bg-background text-foreground h-9 cursor-pointer rounded-lg border px-2.5 text-xs font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          {status !== chapterStatus.PUBLISHED && (
            <button
              type="button"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-lg px-3 text-xs font-medium transition-colors"
            >
              Publish
            </button>
          )}
         
        </form>
      ) : null}
    </div>
  );
}
