"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import type { SessionUser } from "@/app/api/auth/core/session";
import type { CommentThread } from "@/lib/comment-thread";
import CommentSheet from "@/components/modals/CommentSheet";
import ProfileDropdownMenu from "@/components/profile-dropdown-menu";
import ChapterLikeButton from "@/components/book/ChapterLikeButton";
import ChapterReadNav, {
  type ChapterReadNavItem,
} from "@/components/ChapterReadNav";
import { Button } from "@/components/ui/button";
import { ChapterhouseLogo } from "@/components/chapterhouse-logo";

export default function ChapterReadToolbar({
  chapters,
  storyId,
  comments,
  chapterId,
  user,
  showChapterLike,
  initialChapterLiked,
  chapterLikesCount,
}: {
  chapters: ChapterReadNavItem[];
  storyId: string;
  comments: CommentThread[];
  chapterId: string;
  user: SessionUser | null;
  showChapterLike: boolean;
  initialChapterLiked: boolean;
  chapterLikesCount: number;
}) {
  return (
    <div className="border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          aria-label="Chapterhouse home"
        >
          <ChapterhouseLogo />
        </Link>

        {chapters.length > 0 ? (
          <ChapterReadNav chapters={chapters} />
        ) : (
          <div className="flex min-w-0 flex-1 justify-center">
            <Link
              href={`/book/${storyId}/chapters`}
              className="truncate text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              ← Back to chapters
            </Link>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <CommentSheet
            comments={comments}
            storyId={storyId}
            chapterId={chapterId}
          />
          {showChapterLike ? (
            <ChapterLikeButton
              chapterId={chapterId}
              initialLiked={initialChapterLiked}
              likesCount={chapterLikesCount}
            />
          ) : null}
          {user ? (
            <ProfileDropdownMenu user={user} />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full"
              asChild
              aria-label="Log in"
            >
              <Link href="/login">
                <LogIn className="size-5 stroke-[2]" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
