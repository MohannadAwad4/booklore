"use client";

import { addLikeComment } from "@/app/actions/book/comment/like-comment";
import { replyToBookComment } from "@/app/actions/book/comment/add-book-comment";
import { replyToChapterComment } from "@/app/actions/book/comment/add-chapter-comments";
import type { CommentWithUser } from "@/lib/comment-thread";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toastNotLoggedIn } from "@/components/modals/ToastIndex";
import { useUser } from "../providers/SessionUserProvider";
import { Heart, MessageSquare, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChaptersRoute } from "@/app/(story)/book/[storyId]/chapters/chapters-route-context";

export default function CommentItem({
  comment,

  framed = true,
}: {
  comment: CommentWithUser;

  framed?: boolean;
}) {
  const user = useUser();
  const { storyId, chapterId } = useChaptersRoute();
  const action = chapterId ? replyToChapterComment : replyToBookComment;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const likedByMe = Boolean(user && comment.likes && comment.likes.length > 0);
  const displayName = comment.user.displayName ?? comment.user.username;
  const initial = comment.user.username.charAt(0).toUpperCase();

  return (
    <div>
      <div className={framed ? "rounded-lg bg-card/30 px-3 py-2" : "py-1 pl-0"}>
        <div className="flex gap-2.5">
          <Avatar size="sm" className="mt-0.5">
            <AvatarImage src={comment.user.avatarUrl ?? undefined} />
            <AvatarFallback>{initial || "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
              <span className="font-medium text-foreground">{displayName}</span>
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
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <form action={addLikeComment}>
                <input type="hidden" name="commentId" value={comment.id} />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      toastNotLoggedIn();
                    }
                  }}
                  aria-label={likedByMe ? "Unlike comment" : "Like comment"}
                  className="group inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Heart
                    className={cn(
                      "size-3.5 transition",
                      likedByMe
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="tabular-nums text-muted-foreground transition group-hover:text-foreground">
                    {comment.likesCount}
                  </span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowReplyForm((v) => !v)}
                aria-expanded={showReplyForm}
                aria-label={
                  showReplyForm ? "Close reply form" : "Reply to comment"
                }
                className="group inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MessageSquare className="size-3.5 text-muted-foreground transition group-hover:text-foreground" />
                <span className="text-muted-foreground transition group-hover:text-foreground">
                  Reply
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showReplyForm ? (
        <form
          action={action}
          className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end"
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
            className="min-h-[2.5rem] flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
              aria-label="Cancel reply"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
            <button
              disabled={replyContent.trim().length === 0}
              type="submit"
              className={cn(
                "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                replyContent.trim().length === 0 &&
                  "cursor-not-allowed opacity-50"
              )}
            >
              <Send className="size-4" />
              <span>Reply</span>
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
