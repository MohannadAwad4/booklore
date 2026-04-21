"use client";

import { StoryStatus, type Story } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { EllipsisVertical, Heart } from "lucide-react";
import { BookMarkBook, LikeStory } from "@/app/actions/book";

function formatReads(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export type BookCardProps = {
  story: Story;
  /** Logged-in viewer; controls hidden when null. */
  viewerUserId?: string | null;
  initialBookmarked?: boolean;
  initialLiked?: boolean;
};

export default function BookCard({
  story,
  viewerUserId = null,
  initialBookmarked = false,
  initialLiked = false,
}: BookCardProps) {
  const coverSrc = story.coverUrl?.trim() || "/images/default-cover.png";
  const canInteract =
    !!viewerUserId && story.status === StoryStatus.PUBLISHED;

  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);


  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  const runBookmark = () => {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("storyId", story.id);
        const r = await BookMarkBook(fd);
        setBookmarked(r.bookmarked);
      } catch {
        /* auth / validation */
      }
      closeMenu();
    });
  };

  const runLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("storyId", story.id);
        const r = await LikeStory(fd);
        setLiked(r.liked);
      } catch {
        /* auth / validation */
      }
    });
  };

  return (
    <div className="h-full rounded-lg p-0.5 outline-none transition hover:opacity-[0.98] focus-within:ring-2 focus-within:ring-orange-500/80 focus-within:ring-offset-1 focus-within:ring-offset-background">
      <div className="group/cover relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-neutral-200 to-neutral-300 shadow-sm ring-1 ring-black/10 dark:from-neutral-800 dark:to-neutral-900 dark:ring-white/10">
        <Link
          href={`/book/${story.id}/chapters`}
          className="absolute inset-0 z-0 block"
          aria-label={`Open ${story.title}`}
        >
          <Image
            src={coverSrc}
            alt=""
            fill
            className="object-cover object-center transition duration-300 ease-out group-hover/cover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
          />
        </Link>

        {canInteract ? (
          <>
            <div
              ref={menuRef}
              className="absolute right-1 top-1 z-20 opacity-100 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover/cover:pointer-events-auto md:group-hover/cover:opacity-100 md:group-focus-within/cover:pointer-events-auto md:group-focus-within/cover:opacity-100"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/60"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Book actions"
              >
                <EllipsisVertical className="h-[18px] w-[18px]" strokeWidth={2} />
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 min-w-[10.5rem] rounded-lg border border-border bg-background/95 py-1 text-left shadow-lg backdrop-blur-sm"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      runBookmark();
                    }}
                    className="block w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    {bookmarked ? "Remove from library" : "Add to library"}
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={runLike}
              disabled={pending}
              aria-pressed={liked}
              aria-label={liked ? "Unlike" : "Like"}
              className="absolute bottom-1 left-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white opacity-100 shadow-sm backdrop-blur-sm transition hover:bg-black/60 md:pointer-events-none md:opacity-0 md:group-hover/cover:pointer-events-auto md:group-hover/cover:opacity-100 md:group-focus-within/cover:pointer-events-auto md:group-focus-within/cover:opacity-100 disabled:opacity-40"
            >
              <Heart
                className={
                  liked
                    ? "h-5 w-5 fill-red-400 text-red-400"
                    : "h-5 w-5 fill-none text-white"
                }
                strokeWidth={1.75}
              />
            </button>
          </>
        ) : null}
      </div>

      <Link
        href={`/book/${story.id}/chapters`}
        className="mt-0 block rounded-sm pt-1.5 outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80"
      >
        <h3 className="line-clamp-2 text-[11px] font-bold leading-tight tracking-tight text-foreground hover:underline sm:text-xs">
          {story.title}
        </h3>
        {story.viewsCount > 0 ? (
          <p className="mt-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400 sm:text-xs">
            {formatReads(story.viewsCount)} reads
          </p>
        ) : null}
      </Link>
    </div>
  );
}
