
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import CommentThreads from "../comments/CommentThreads";
import type { CommentThread } from "@/lib/comment-thread";
import ChapterCommentComposer from "@/components/comments/ChapterCommentComposer";
import { cn } from "@/lib/utils";

export default function CommentSheet({
  comments,
  storyId,
  chapterId,
}: {
  comments: CommentThread[];
  storyId: string;
  chapterId: string;
}) {
  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          aria-label="Open comments"
        >
          <MessageCircle className="size-5 stroke-[2]" />
        </Button>
      </SheetTrigger>
      <SheetContent
        overlayClassName="pointer-events-none"
        preventDismissOnOutside
        className={cn(
          "!top-14 !h-[calc(100dvh-3.5rem)] flex flex-col gap-0 overflow-hidden border-t border-border p-0 sm:!top-16 sm:!h-[calc(100dvh-4rem)] sm:max-w-md"
        )}
      >
        <SheetHeader className="shrink-0 border-b border-border px-5 py-5 pr-14">
          <SheetTitle className="font-serif text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Comments
          </SheetTitle>
        </SheetHeader>
        <ChapterCommentComposer storyId={storyId} chapterId={chapterId} />
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          <CommentThreads comments={comments} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
