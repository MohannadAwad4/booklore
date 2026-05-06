import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Story } from "@prisma/client";
import { notFound } from "next/navigation";
import TabRoot from "@/components/profile/(tabs)/TabRoot";
import { AvatarPlaceholder } from "@/components/media-placeholders";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import FollowButton from "@/components/buttons/FollowButton";
import { isFollowing } from "@/lib/isFollowing";
import Section from "@/components/profile/Section";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userid: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ userid }, { tab }] = await Promise.all([params, searchParams]);
  const [user, booksCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userid },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        followersCount: true,
        followingCount: true,
      },
    }),
    prisma.story.count({ where: { authorId: userid } }),
  ]);

  if (!user) notFound();
  const currentUser = await GetUserSession();
  const isFollowingInitial = currentUser?.id
    ? await isFollowing(currentUser.id, user.id)
    : false;
  let tabData: Story[] = [];
  if (tab == null || tab === "my-books") {
    tabData = await prisma.story.findMany({
      where: { authorId: userid },
      orderBy: { createdAt: "desc" },
    });
  } else if (tab === "liked-books") {
    tabData = await prisma.story.findMany({
      where: { likes: { some: { userId: userid } } },
      orderBy: { createdAt: "desc" },
    });
  } else if (tab === "bookmarked") {
    tabData = await prisma.story.findMany({
      where: { bookmarks: { some: { userId: userid } } },
      orderBy: { createdAt: "desc" },
    });
  }

  const tabStoryIds = tabData.map((s) => s.id);
  let bookmarkedStoryIds: string[] = [];
  let likedStoryIds: string[] = [];
  if (currentUser && tabStoryIds.length > 0) {
    const [bookmarkRows, likeRows] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: currentUser.id, storyId: { in: tabStoryIds } },
        select: { storyId: true },
      }),
      prisma.storyLike.findMany({
        where: { userId: currentUser.id, storyId: { in: tabStoryIds } },
        select: { storyId: true },
      }),
    ]);
    bookmarkedStoryIds = bookmarkRows.map((r) => r.storyId);
    likedStoryIds = likeRows.map((r) => r.storyId);
  }

  const displayName = user.displayName?.trim() || user.username;
  const isOwner = currentUser?.id === user.id;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="size-24 rounded-full object-cover ring-2 ring-border sm:size-28"
            />
          ) : (
            <div
              className="flex size-24 items-center justify-center rounded-full bg-muted ring-2 ring-border sm:size-28"
              aria-hidden
            >
              <AvatarPlaceholder className="h-12 w-12 text-muted-foreground sm:h-14 sm:w-14" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {displayName}
              </h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {isOwner ? (
                <Link
                  href="/book/create-book"
                  className="inline-flex items-center justify-center rounded-full bg-button px-5 py-2.5 text-sm font-medium text-button-foreground transition-opacity hover:opacity-90"
                >
                  Writer Studio
                </Link>
              ) : (
                <FollowButton
                  targetUserId={user.id}
                  isFollowingInitial={isFollowingInitial}
                />
              )}
            </div>
          </div>
          {user.bio?.trim() ? (
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {user.bio}
            </p>
          ) : null}
        </div>
      </header>

      <Section
        followers={user.followersCount}
        following={user.followingCount}
        books={booksCount}
      />

      <Suspense
        fallback={<div className="text-sm text-muted-foreground">Loading…</div>}
      >
        <TabRoot
          tabData={tabData}
          bookmarkedStoryIds={bookmarkedStoryIds}
          likedStoryIds={likedStoryIds}
        />
      </Suspense>
    </div>
  );
}
