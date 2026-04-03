import { GetUserSession } from "@/app/api/auth/core/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateChapter from "@/app/actions/chapter/create-chapter";

import MyChapterItem from "@/components/MyChapterItem";
import BookComments from "@/components/BookComments";
import AddBookComment from "@/app/actions/book/comment/add-book-comment";

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
  });
  const comments = await prisma.comment.findMany({
    where: { storyId },
    include: {
      user: { select: { username: true, displayName: true } },
    },
  });
  const userIsAuthor = user && story?.authorId === user.id;

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
