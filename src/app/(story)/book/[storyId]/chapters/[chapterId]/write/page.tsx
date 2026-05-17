import { GetUserSession } from "@/app/api/auth/core/session";
import ChapterTitle from "@/components/ChapterTitle";
import { prisma } from "@/lib/prisma";
import Editor from "@/components/rich-text-editor";
import Link from "next/link";
import { redirect } from "next/navigation";
export default async function WriteChapterPage({
  params,
}: {
  params: Promise<{ storyId: string; chapterId: string }>;
}) {
  const { storyId, chapterId } = await params;
  if (!storyId || !chapterId) {
    return <div>Chapter not found</div>;
  }
  const user = await GetUserSession();
  if (!user) {
    const back = `/book/${storyId}/chapters/${chapterId}/write`;
    redirect(`/?openAuth=1&redirect=${encodeURIComponent(back)}`);
  }
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, storyId },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      chapterNumber: true,
    },
  });
  if (!chapter) {
    return (
      <div>Chapter not found or you do not have permission to edit it.</div>
    );
  }
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full">
      <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-3 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <ChapterTitle chapterId={chapter.id} title={chapter.title} />

        <Link
          href={`/book/${storyId}/chapters`}
          className="shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          ← Back to chapters
        </Link>
      </header>
      <div className="flex-1 min-h-0 w-full">
        <Editor chapterId={chapter.id} initialContent={chapter.content} />
      </div>
    </div>
  );
}
