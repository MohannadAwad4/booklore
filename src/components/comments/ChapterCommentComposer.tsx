"use client";

import AddChapterComment from "@/app/actions/book/comment/add-chapter-comments";
import { openAuthModal } from "@/lib/auth-modal-bridge";
import { Send } from "lucide-react";
import { useUser } from "../providers/SessionUserProvider";

const shellClass =
  "flex w-full shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-3";

const inputShellClass =
  "border-border/80 bg-background text-foreground flex w-full items-center gap-2 rounded-full border py-1.5 pl-4 pr-1.5 shadow-sm dark:border-border dark:bg-card sm:pl-5";

const addBtnClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-button text-button-foreground shadow-sm transition hover:opacity-90";

export default function ChapterCommentComposer({
  storyId,
  chapterId,
}: {
  storyId: string;
  chapterId: string;
}) {
  const user = useUser();

  if (!user) {
    return (
      <div className={shellClass}>
        <div className={inputShellClass}>
          <label htmlFor="chapter-comment-guest" className="sr-only">
            Comment
          </label>
          <textarea
            id="chapter-comment-guest"
            readOnly
            rows={1}
            placeholder="Sign in to add a comment…"
            className="placeholder:text-muted-foreground field-sizing-content max-h-24 min-h-0 w-full flex-1 cursor-pointer resize-none border-0 bg-transparent py-1.5 text-sm leading-tight outline-none focus-visible:outline-none"
            onClick={() => openAuthModal({ tab: "login" })}
            onFocus={() => openAuthModal({ tab: "login" })}
          />
          <button
            type="button"
            aria-label="Sign in to comment"
            className={addBtnClass}
            onClick={() => openAuthModal({ tab: "login" })}
          >
            <Send className="size-3.5" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <form action={AddChapterComment} className={inputShellClass}>
        <input type="hidden" name="chapterId" value={chapterId} />
        <input type="hidden" name="storyId" value={storyId} />
        <label htmlFor="chapter-comment" className="sr-only">
          Comment
        </label>
        <textarea
          id="chapter-comment"
          name="content"
          required
          rows={1}
          placeholder="Add a comment…"
          className="placeholder:text-muted-foreground field-sizing-content max-h-24 min-h-0 w-full flex-1 resize-none border-0 bg-transparent py-1.5 text-sm leading-tight outline-none focus-visible:outline-none"
        />
        <button type="submit" aria-label="Add comment" className={addBtnClass}>
          <Send className="size-3.5" strokeWidth={2.25} aria-hidden />
        </button>
      </form>
    </div>
  );
}
