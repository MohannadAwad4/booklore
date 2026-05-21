"use client";

import Link from "next/link";
import type { ChapterReadNavItem } from "../ChapterReadNav";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { BookOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChapterSheet({
  chapterId,
  storyId,
  chapters,
}: {
  chapterId: string;
  storyId: string;
  chapters: ChapterReadNavItem[];
}) {
  return (
    <Sheet modal={false} defaultOpen>
      <SheetTrigger asChild>
        <Button
          size="icon-lg"
          className="rounded-r-xl rounded-l-none shadow-lg"
          aria-label="Open chapter list"
        >
          <BookOpenIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        overlayClassName="pointer-events-none"
        preventDismissOnOutside
        className="!top-14 !h-[calc(100dvh-3.5rem)] w-56 gap-0 border-r border-t border-border bg-background p-0 text-foreground sm:!top-16 sm:!h-[calc(100dvh-4rem)] sm:max-w-56"
      >
        <SheetHeader className="border-b border-border px-5 py-5 pr-14">
          <SheetTitle className="font-serif text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Contents
          </SheetTitle>
        </SheetHeader>
        <nav
          className="flex-1 overflow-y-auto py-3 font-serif [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Chapter list"
        >
          {chapters.map((chapter) => {
            const isCurrent = chapter.id === chapterId;

            return (
              <SheetClose key={chapter.id} asChild>
                <Link
                  href={`/book/${storyId}/chapters/${chapter.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "block px-5 py-2.5 transition hover:bg-muted",
                    isCurrent
                      ? "bg-button/15 text-foreground hover:bg-button/20"
                      : "text-foreground"
                  )}
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-button">
                    Chapter {chapter.chapterNumber}
                  </span>
                  <span className="mt-0.5 block font-sans text-sm leading-snug text-ui-primary">
                    {chapter.title}
                  </span>
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
