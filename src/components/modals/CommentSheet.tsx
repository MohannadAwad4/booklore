import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CommentThreads from "../comments/CommentThreads";
import type { CommentThread } from "@/lib/comment-thread";
import AddChapterComment from "@/app/actions/book/comment/add-chapter-comments";
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
        <button type="button">Open</button>
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
        <form
          action={AddChapterComment}
          className="shrink-0 space-y-2 border-b border-border px-4 py-3"
        >
          <input type="hidden" name="chapterId" value={chapterId} />
          <input type="hidden" name="storyId" value={storyId} />
          <textarea
            required
            name="content"
            placeholder="Add a comment"
            rows={3}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Add Comment
          </button>
        </form>
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
