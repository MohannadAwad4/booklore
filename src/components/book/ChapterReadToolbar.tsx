"use client";

import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";
import type { CommentThread } from "@/lib/comment-thread";
import CommentSheet from "@/components/modals/CommentSheet";
import ProfileDropdownMenu from "@/components/profile-dropdown-menu";
import ChapterLikeButton from "@/components/book/ChapterLikeButton";
import { BrandWordmark, brandHomeAriaLabel } from "@/components/brand-wordmark";
import { useUser } from "../providers/SessionUserProvider";
import { useChaptersRoute } from "@/app/(story)/book/[storyId]/chapters/chapters-route-context";
import { AuthNavTrigger } from "../providers/AuthModalProvider";
import { useReaderMode } from "./ReaderModeProvider";

export default function ChapterReadToolbar({
  storyTitle,
  comments,
  showChapterLike,
  initialChapterLiked,
  chapterLikesCount,
}: {
  storyTitle: string;
  comments: CommentThread[];
  showChapterLike: boolean;
  initialChapterLiked: boolean;
  chapterLikesCount: number;
}) {
  const user = useUser();
  const { chapterId, storyId } = useChaptersRoute();
  return (
    <div className="border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="relative flex h-14 w-full items-center justify-between px-5 sm:h-16 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="z-10 shrink-0 transition-opacity hover:opacity-80"
          aria-label={brandHomeAriaLabel}
        >
          <BrandWordmark />
        </Link>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-28 sm:px-44">
          <div className="pointer-events-auto flex min-w-0 max-w-[min(100%,26rem)] items-center">
            <p className="min-w-0 truncate font-serif text-lg font-bold uppercase leading-none tracking-[0.28em] text-muted-foreground sm:text-xl">
              {storyTitle}
            </p>
          </div>
        </div>

        <div className="z-10 flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ReaderModeToggle />
          <CommentSheet
            comments={comments}
            storyId={storyId}
            chapterId={chapterId ?? ""}
          />
          {showChapterLike ? (
            <ChapterLikeButton
              chapterId={chapterId ?? ""}
              initialLiked={initialChapterLiked}
              likesCount={chapterLikesCount}
            />
          ) : null}
          {user ? <ProfileDropdownMenu user={user} /> : <AuthNavTrigger />}
        </div>
      </div>
    </div>
  );
}

function ReaderModeToggle() {
  const { readerMode, setReaderMode } = useReaderMode();
  const nextMode = readerMode === "book" ? "regular" : "book";
  const label =
    nextMode === "book" ? "Switch to book view" : "Switch to regular view";
  const Icon = nextMode === "book" ? BookOpen : FileText;

  return (
    <button
      type="button"
      onClick={() => setReaderMode(nextMode)}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:bg-accent hover:text-button"
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}
