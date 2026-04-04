import { GetUserSession } from "@/app/api/auth/core/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateChapter from "@/app/actions/chapter/create-chapter";

import MyChapterItem from "@/components/MyChapterItem";
import BookComments from "@/components/comments/BookComments";
import AddBookComment from "@/app/actions/book/comment/add-book-comment";
import FollowButton from "@/components/follow/FollowButton";

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
  const comments = await prisma.comment.findMany({
    where: { storyId },
    include: {
      user: { select: { username: true, displayName: true } },
    },
  });
  const userIsAuthor = user && story?.authorId === user.id;

  let authorFollowInitial = false;
  if (user && story?.author && user.id !== story.author.id) {
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
  if (!chapters || chapters.length === 0) {
    return (
      <div className="p-4">
        {userIsAuthor && (
          <form action={CreateChapter}>
            <input type="hidden" name="storyId" value={storyId} />
            <button type="submit">Create Chapter</button>
          </form>
        )}
        <h1 className="text-2xl font-bold">No chapters available</h1>
      </div>
    );
  }

  return (
    <div>
      {!userIsAuthor && story?.author && (
        <div className="mb-4 flex flex-wrap items-center gap-4">
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
    </div>
  );
}
