
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
          "flex h-full max-h-dvh flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        )}
      >
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3 pr-14">
          <SheetTitle>Comments</SheetTitle>
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
