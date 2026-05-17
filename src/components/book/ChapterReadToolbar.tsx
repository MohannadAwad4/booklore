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
      <div className="relative flex h-14 w-full items-center justify-between px-5 sm:h-16 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="z-10 shrink-0 transition-opacity hover:opacity-80"
          aria-label="Chapterhouse home"
        >
          <ChapterhouseLogo />
        </Link>

        {chapters.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-28 sm:px-36">
            <div className="pointer-events-auto w-full max-w-[min(100%,16rem)] sm:max-w-xs">
              <ChapterReadNav chapters={chapters} />
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Link
              href={`/book/${storyId}/chapters`}
              className="pointer-events-auto truncate text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              ← Back to chapters
            </Link>
          </div>
        )}

        <div className="z-10 flex shrink-0 items-center gap-0.5 sm:gap-1">
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
