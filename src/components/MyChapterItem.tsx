"use client";

import SetChapterStatus from "@/app/actions/chapter";
import { ChapterType } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoryStatus } from "@prisma/client";

export default function MyChapterItem({ chapter, storyId, userIsAuthor }: { chapter: ChapterType, storyId: string, userIsAuthor: boolean | null }) {
  const router = useRouter();

  async function handleStatusSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await SetChapterStatus(formData);
    router.refresh();
  }

  return (
    <div>
      <Link href={userIsAuthor && chapter.status ===StoryStatus.DRAFT ? `/book/${chapter.storyId}/chapters/${chapter.id}/write` : `/book/${chapter.storyId}/chapters/${chapter.id}`}>
        {chapter.title}
        
      </Link>
      {userIsAuthor && (
      <form onSubmit={handleStatusSubmit} className="inline">
        <input type="hidden" name="chapterId" value={chapter.id} />
        <select
          name="status"
          defaultValue={chapter.status}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <button
          type="submit"
          className="ml-4 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
        >
          Submit
        </button>
      </form>
      )}
    </div>
  );
}
