import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import Editor from "@/components/rich-text-editor";
import CommentThreads from "@/components/comments/CommentThreads";
import ChapterTitle from "@/components/ChapterTitle";
import PublishedChapterDisplay from "@/components/PublishedChapterDisplay";
import AddChapterComment from "@/app/actions/book/comment/add-chapter-comments";
import CommentSheet from "@/components/modals/CommentSheet";
export default async function ChapterEditPage({
  params,
}: {
  params: Promise<{ storyId: string; chapterId: string }>;
}) {
  const { storyId, chapterId } = await params;
  if (!storyId || !chapterId) {
    return <div>Invalid story or chapter ID</div>;
  }

  const user = await GetUserSession();
  const viewerId = user?.id ?? null;

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
        user: {
          select: { username: true, displayName: true, avatarUrl: true },
        },
        ...(viewerId
          ? { likes: { where: { userId: viewerId }, select: { id: true } } }
          : {}),
        replies: {
          where: { chapterId },
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
            ...(viewerId
              ? { likes: { where: { userId: viewerId }, select: { id: true } } }
              : {}),
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

  return (
    <div>
      <PublishedChapterDisplay
        chapter={chapter}
        storyId={storyId}
        chapters={allChapters}
      />
      <CommentSheet
        comments={comments}
        storyId={storyId}
        chapterId={chapterId}
      />
    </div>
  );
}
