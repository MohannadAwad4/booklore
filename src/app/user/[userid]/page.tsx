import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Story } from "@prisma/client";
import { notFound } from "next/navigation";
import TabRoot from "@/components/profile/(tabs)/TabRoot";
import Image from "next/image";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import FollowButton from "@/components/follow/FollowButton";
import { isFollowing } from "@/lib/isFollowing";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userid: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ userid }, { tab }] = await Promise.all([params, searchParams]);
  const user = await prisma.user.findUnique({
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
  });

  if (!user) notFound();
 const currentUser = await GetUserSession();
  const isFollowingInitial = currentUser?.id ? await isFollowing(currentUser.id, user.id) : false;
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

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <div>
        <Image
          src={user.avatarUrl ? user.avatarUrl : "/images/default-avatar.png"}
          alt={user.displayName?.trim() || user.username}
          width={100}
          height={100}
        />
        <h1 className="text-2xl font-bold">
          {user.displayName?.trim() || user.username}
        </h1>
        {currentUser?.id === user.id?<Link href={`/book/create-book`}>Writer Studio</Link>:<FollowButton targetUserId={user.id} isFollowingInitial={isFollowingInitial} />}
        <p className="text-muted-foreground">@{user.username}</p>
      </div>
      <h1 className="text-1xl ">{user.bio ?? ""}</h1>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {user.followersCount}
        </span>{" "}
        followers ·{" "}
        <span className="font-medium text-foreground">
          {user.followingCount}
        </span>{" "}
        following
      </p>
      <Suspense
        fallback={<div className="text-sm text-muted-foreground">Loading…</div>}
      >
        <TabRoot
          tabData={tabData}
          viewerUserId={currentUser?.id ?? null}
          bookmarkedStoryIds={bookmarkedStoryIds}
          likedStoryIds={likedStoryIds}
        />
      </Suspense>
    </div>
  );
}
