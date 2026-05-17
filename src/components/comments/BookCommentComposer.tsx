"use client";

import AddBookComment from "@/app/actions/book/comment/add-book-comment";
import { openAuthModal } from "@/lib/auth-modal-bridge";
import { Send } from "lucide-react";
import { useUser } from "../providers/SessionUserProvider";
import { useChaptersRoute } from "@/app/(story)/book/[storyId]/chapters/chapters-route-context";

const shellClass =
  "border-border/80 bg-background text-foreground flex w-full items-center gap-2 rounded-full border py-1.5 pl-4 pr-1.5 shadow-sm dark:border-border dark:bg-card sm:pl-5";

const sendBtnClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-button text-button-foreground shadow-sm transition hover:bg-button/90";

export default function BookCommentComposer() {
  const user = useUser();
  const { storyId } = useChaptersRoute();
  if (!user) {
    return (
      <div className={shellClass}>
        <label htmlFor="book-comment-guest" className="sr-only">
          Comment
        </label>
        <textarea
          id="book-comment-guest"
          readOnly
          rows={1}
          placeholder="Sign in to comment…"
          className="placeholder:text-muted-foreground field-sizing-content max-h-24 min-h-0 w-full flex-1 cursor-pointer resize-none border-0 bg-transparent py-1.5 text-sm leading-tight outline-none focus-visible:outline-none"
          onClick={() => openAuthModal({ tab: "login" })}
          onFocus={() => openAuthModal({ tab: "login" })}
        />
        <button
          type="button"
          aria-label="Sign in to comment"
          className={sendBtnClass}
          onClick={() => openAuthModal({ tab: "login" })}
        >
          <Send className="size-3.5" strokeWidth={2.25} />
        </button>
      </div>
    );
  }

  return (
    <form action={AddBookComment} className={shellClass}>
      <input type="hidden" name="storyId" value={storyId} />
      <label htmlFor="book-comment" className="sr-only">
        Comment
      </label>
      <textarea
        id="book-comment"
        name="content"
        required
        rows={1}
        placeholder="Write a comment..."
        className="placeholder:text-muted-foreground field-sizing-content max-h-24 min-h-0 w-full flex-1 resize-none border-0 bg-transparent py-1.5 text-sm leading-tight outline-none focus-visible:outline-none"
      />
      <button
        type="submit"
        aria-label="Send comment"
        className={sendBtnClass}
      >
        <Send className="size-3.5" strokeWidth={2.25} />
      </button>
    </form>
  );
}
