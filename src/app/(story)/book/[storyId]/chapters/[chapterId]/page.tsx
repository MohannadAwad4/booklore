import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import ChapterReadToolbar from "@/components/book/ChapterReadToolbar";
import ChapterSheet from "@/components/modals/ChapterSheet";
import { redirect } from "next/navigation";
import { chapterStatus } from "@/lib/enums";
import PublishedChapterDisplay from "@/components/PublishedChapterDisplay";
import { ReaderModeProvider } from "@/components/book/ReaderModeProvider";
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
      likesCount: true,
      authorId: true,
      story: {
        select: {
          title: true,
          coverUrl: true,
        },
      },
    },
  });
  if (!chapter) {
    return (
      <div>Chapter not found or you do not have permission to edit it.</div>
    );
  }

  const isAuthor = Boolean(user && chapter.authorId === user.id);
  if (isAuthor && chapter.status !== chapterStatus.PUBLISHED) {
    redirect(`/book/${storyId}/chapters/${chapterId}/write`);
  }

  const isPublished = chapter.status === chapterStatus.PUBLISHED;
  const [comments, chapters, chapterLikeRow] = await Promise.all([
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
    viewerId && isPublished
      ? prisma.chapterLike.findUnique({
          where: {
            userId_chapterId: { userId: viewerId, chapterId },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const initialChapterLiked = Boolean(chapterLikeRow);
  const nextChapter =
    chapters.find((item) => item.chapterNumber > chapter.chapterNumber) ?? null;

  return (
    <ReaderModeProvider>
      <div>
        <div className="sticky top-0 z-30">
          <ChapterReadToolbar
            storyTitle={chapter.story.title}
            comments={comments}
            showChapterLike={isPublished}
            initialChapterLiked={initialChapterLiked}
            chapterLikesCount={chapter.likesCount}
          />
        </div>
        {chapters.length > 0 ? (
          <div className="fixed left-0 top-24 z-20">
            <ChapterSheet
              chapterId={chapterId}
              storyId={storyId}
              chapters={chapters}
            />
          </div>
        ) : null}
        <PublishedChapterDisplay
          chapter={chapter}
          storyId={storyId}
          nextChapter={nextChapter}
        />
      </div>
    </ReaderModeProvider>
  );
}
