import Link from "next/link";
import { ListOrdered, Plus } from "lucide-react";
import { GetUserSession } from "@/app/api/auth/core/session";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateChapter from "@/app/actions/chapter/create-chapter";
import MyChapterItem from "@/components/items/MyChapterItem";
import CommentThreads from "@/components/comments/CommentThreads";
import BookCommentComposer from "@/components/comments/BookCommentComposer";
import FollowButton from "@/components/buttons/FollowButton";
import ChapterInfo from "@/components/cards/ChapterInfo";
import { StorySource } from "@prisma/client";

export default async function Chapters({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const user = await GetUserSession();
  const { storyId } = await params;

  const story = await prisma.story.findUnique({
    where: { id: storyId },
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

  const viewerId = user?.id ?? null;
  const comments = await prisma.comment.findMany({
    where: { storyId, chapterId: null, parentId: null },
    include: {
      user: { select: { username: true, displayName: true, avatarUrl: true } },
      ...(viewerId
        ? { likes: { where: { userId: viewerId }, select: { id: true } } }
        : {}),
      replies: {
        where: { chapterId: null },
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
  });

  const userIsAuthor = Boolean(user && story.authorId === user.id);

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
    orderBy: { createdAt: "desc" },
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

  const authorDisplay =
    story.author.displayName?.trim() || story.author.username;

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-5 md:px-6 md:py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <ChapterInfo
          className="mb-6 lg:mb-0"
          userId={user?.id ?? null}
          story={storySidebarMeta}
        />

        <main className="min-w-0 flex-1 space-y-8">
          {story.storySource === StorySource.USER &&
          !userIsAuthor &&
          hasChapters ? (
            <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Author
                  </p>
                  <Link
                    href={`/user/${story.author.id}`}
                    className="text-lg font-semibold text-foreground hover:underline"
                  >
                    {authorDisplay}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    @{story.author.username} · {story.author.followersCount}{" "}
                    followers · {story.author.followingCount} following
                  </p>
                </div>
                <FollowButton
                  className="shrink-0 self-start sm:self-center"
                  targetUserId={story.author.id}
                  isFollowingInitial={authorFollowInitial}
                />
              </div>
            </section>
          ) : null}

          {userIsAuthor ? (
            <section>
              <form
                action={CreateChapter}
                className="flex flex-wrap items-center gap-3"
              >
                <input type="hidden" name="storyId" value={storyId} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-button px-4 py-2.5 text-sm font-medium text-button-foreground shadow-sm transition hover:opacity-90 active:opacity-95"
                >
                  <Plus className="size-4 shrink-0" strokeWidth={2.5} />
                  New chapter
                </button>
              </form>
            </section>
          ) : null}

          {hasChapters ? (
            <>
              <section className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                    <ListOrdered
                      className="size-5 shrink-0 text-muted-foreground"
                      strokeWidth={2}
                    />
                    Chapters
                  </h2>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {chapters.length}{" "}
                    {chapters.length === 1 ? "chapter" : "chapters"}
                  </span>
                </div>
                <div className="max-h-[min(60vh,42rem)] overflow-y-auto overscroll-y-contain rounded-xl border border-border bg-card shadow-sm">
                  <ul className="divide-y divide-border">
                    {chapters.map((chapter) => (
                      <li key={chapter.id}>
                        <MyChapterItem
                          chapter={chapter}
                          storyId={storyId}
                          userIsAuthor={userIsAuthor}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-4 border-t border-border pt-8">
                <BookCommentComposer
                  storyId={storyId}
                  canComment={Boolean(user)}
                />
                <CommentThreads comments={comments} />
              </section>
            </>
          ) : (
            <section className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                No chapters yet
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {userIsAuthor
                  ? "Create your first chapter to start publishing this story."
                  : "This story doesn’t have any published chapters to read right now."}
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
