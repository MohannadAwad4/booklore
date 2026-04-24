"use client";

import { addLikeComment } from "@/app/actions/book/comment/like-comment";
import { replyToBookComment } from "@/app/actions/book/comment/add-book-comment";
import { replyToChapterComment } from "@/app/actions/book/comment/add-chapter-comments";
import type { CommentWithUser } from "@/lib/comment-thread";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function CommentItem({
  comment,
  storyId,
  chapterId,
  framed = true,
}: {
  comment: CommentWithUser;
  storyId: string;
  chapterId?: string;
  framed?: boolean;
}) {
  const action = chapterId ? replyToChapterComment : replyToBookComment;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  return (
    <div>
      <div
        className={
          framed
            ? "rounded-lg border border-border bg-card/30 px-3 py-2"
            : "py-1 pl-0"
        }
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
          <span className="font-medium text-foreground">
            {comment.user.displayName ?? comment.user.username}
          </span>
          <span className="text-muted-foreground">
            @{comment.user.username}
          </span>
          <time
            className="text-xs text-muted-foreground"
            dateTime={comment.createdAt.toISOString()}
          >
            {comment.createdAt.toLocaleDateString()}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
          {comment.content}
        </p>
        <form action={addLikeComment} className="mt-2 flex items-center gap-2">
          <input type="hidden" name="commentId" value={comment.id} />
          <button
            type="submit"
            className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            Like
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {comment.likesCount}
          </span>
        </form>
      </div>
      {showReplyForm ? (
        <form
          action={action}
          className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="storyId" value={storyId} />
          {chapterId ? (
            <input type="hidden" name="chapterId" value={chapterId} />
          ) : null}
          <input type="hidden" name="parentId" value={comment.id} />
          <textarea
            name="content"
            required
            rows={2}
            placeholder="Write a reply…"
            className="min-h-[2.5rem] flex-1 resize-y rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setShowReplyForm(false);
              setReplyContent("");
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={replyContent.trim().length === 0}
            type="submit"
            className={cn(
              "shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
              replyContent.trim().length === 0 &&
                "cursor-not-allowed opacity-50",
            )}
          >
            Reply
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowReplyForm(true)}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Reply
        </button>
      )}
    </div>
  );
}
