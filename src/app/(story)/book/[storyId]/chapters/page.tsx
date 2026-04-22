import { GetUserSession } from "@/app/api/auth/core/session";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateChapter from "@/app/actions/chapter/create-chapter";
import MyChapterItem from "@/components/MyChapterItem";
import BookComments from "@/components/comments/BookComments";
import AddBookComment from "@/app/actions/book/comment/add-book-comment";
import FollowButton from "@/components/follow/FollowButton";
import ChapterInfo from "@/components/cards/ChapterInfo";
export default async function Chapters({
  params,
}: {
  params: { storyId: string };
}) {
  const user = await GetUserSession();
  const { storyId } = await params;

  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          followersCount: true,
          followingCount: true,
        },
      },
    },
  });
  if (!story) notFound();

  const comments = await prisma.comment.findMany({
    where: { storyId },
    include: {
      user: { select: { username: true, displayName: true } },
    },
  });
  const userIsAuthor = user && story.authorId === user.id;

  let authorFollowInitial = false;
  if (user && user.id !== story.author.id) {
    const row = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: story.author.id,
        },
      },
    });
    authorFollowInitial = !!row;
  }

  const chapters = await prisma.chapter.findMany({
    where: {
      storyId,
      status: userIsAuthor ? undefined : "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const hasChapters = chapters.length > 0;

  const storySidebarMeta = {
    id: story.id,
    title: story.title,
    description: story.description,
    coverUrl: story.coverUrl,
    authorId: story.authorId,
    createdAt: story.createdAt,
  };

  return (
    <div className="p-4 lg:flex lg:items-start lg:gap-8">
      <ChapterInfo
        className="mb-6 lg:mb-0"
        userId={user?.id ?? null}
        story={storySidebarMeta}
      />
      <div className="min-w-0 flex-1 space-y-4">
        {!userIsAuthor && hasChapters && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {story.author.followersCount} followers ·{" "}
              {story.author.followingCount} following
            </p>
            <FollowButton
              targetUserId={story.author.id}
              isFollowingInitial={authorFollowInitial}
            />
          </div>
        )}
        {userIsAuthor && (
          <form action={CreateChapter}>
            <input type="hidden" name="storyId" value={storyId} />
            <button type="submit">Create Chapter</button>
          </form>
        )}
        {hasChapters ? (
          <>
            <div>
              {chapters.map((chapter) => (
                <MyChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  storyId={storyId}
                  userIsAuthor={userIsAuthor}
                />
              ))}
            </div>
            <h2>Comments</h2>
            <form action={AddBookComment}>
              <input type="hidden" name="storyId" value={storyId} />
              <textarea name="content" placeholder="Add a comment" />
              <button type="submit">Add Comment</button>
            </form>
            <BookComments comments={comments} storyId={storyId} />
          </>
        ) : (
          <h1 className="text-2xl font-bold">No chapters available</h1>
        )}
      </div>
    </div>
  );
}
