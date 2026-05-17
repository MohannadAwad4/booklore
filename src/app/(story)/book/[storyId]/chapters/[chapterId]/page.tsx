import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import PublishedChapterDisplay from "@/components/PublishedChapterDisplay";
import ChapterReadToolbar from "@/components/book/ChapterReadToolbar";
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
    },
  });
  if (!chapter) {
    return (
      <div>Chapter not found or you do not have permission to edit it.</div>
    );
  }
  const isPublished = chapter.status === "PUBLISHED";
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

  return (
    <div>
      <div className="sticky top-0 z-30">
        <ChapterReadToolbar
          chapters={chapters}
          storyId={storyId}
          comments={comments}
          chapterId={chapterId}
          user={user}
          showChapterLike={isPublished}
          initialChapterLiked={initialChapterLiked}
          chapterLikesCount={chapter.likesCount}
        />
      </div>
      <PublishedChapterDisplay
        chapter={chapter}
      />
      
    </div>
  );
}
