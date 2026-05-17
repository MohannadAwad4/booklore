"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { LikeChapter } from "@/app/actions/book";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/providers/SessionUserProvider";
import { toastNotLoggedIn } from "@/components/modals/ToastIndex";

export default function ChapterLikeButton({
  chapterId,
  initialLiked,
  likesCount: initialCount,
}: {
  chapterId: string;
  initialLiked: boolean;
  likesCount: number;
}) {
  const sessionUser = useUser();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!sessionUser) {
      toastNotLoggedIn();
      return;
    }
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("chapterId", chapterId);
        const r = await LikeChapter(fd);
        setLiked(r.liked);
        setCount((c) => (r.liked ? c + 1 : Math.max(0, c - 1)));
      } catch {
        /* auth / validation */
      }
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Unlike chapter" : "Like chapter"}
        className="size-9 shrink-0 rounded-full"
        onClick={onClick}
      >
        <Heart
          className={cn(
            "size-5 stroke-[2]",
            liked && "fill-red-500 text-red-500 dark:fill-red-500 dark:text-red-500"
          )}
        />
      </Button>
      {count > 0 ? (
        <span className="min-w-[1.25rem] pr-0.5 text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      ) : null}
    </div>
  );
}
