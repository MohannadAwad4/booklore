import { redirect } from "next/navigation";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import Editor from "@/components/rich-text-editor";
import Form from "next/form";
import { UpdateChapter } from "@/app/actions/chapter";
import CommentThreads from "@/components/comments/CommentThreads";
import ChapterTitle from "@/components/ChapterTitle";
import PublishedChapterDisplay from "@/components/PublishedChapterDisplay";
import AddChapterComment from "@/app/actions/book/comment/add-chapter-comments";
export default async function ChapterEditPage({
  params,
}: {
  params: Promise<{ storyId: string; chapterId: string }>;
}) {
  const { storyId, chapterId } = await params;
  if (!storyId || !chapterId) {
    return <div>Invalid story or chapter ID</div>;
  }

  // const user = await GetUserSession();
  // if (!user) redirect("/login");

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
  const isPublished = chapter.status === "PUBLISHED";
  const [comments, allChapters] = await Promise.all([
    prisma.comment.findMany({
      where: { chapterId, parentId: null },
      include: {
        user: { select: { username: true, displayName: true } },
        replies: {
          where: { chapterId },
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { username: true, displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    isPublished
      ? prisma.chapter.findMany({
          where: { storyId, status: "PUBLISHED" },
          select: { id: true, chapterNumber: true, title: true },
          orderBy: { chapterNumber: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (chapter.status === "PUBLISHED") {
    return (
      <div>
        <PublishedChapterDisplay
          chapter={chapter}
          storyId={storyId}
          chapters={allChapters}
        />
        <form action={AddChapterComment}>
          <input type="hidden" name="chapterId" value={chapterId} />
          <input type="hidden" name="storyId" value={storyId} />
          <textarea required name="content" placeholder="Add a comment" />
          <button type="submit">Add Comment</button>
        </form>
        <CommentThreads
          comments={comments}
          storyId={storyId}
          chapterId={chapterId}
        />
      </div>
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
