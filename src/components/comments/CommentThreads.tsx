"use client";

import type { CommentThread } from "@/lib/comment-thread";
import CommentItem from "@/components/items/CommentItem";
import { useEffect, useState } from "react";

/** Book-level (`chapterId` omitted) or chapter-level threaded comments. */
export default function CommentThreads({
  comments,
  storyId,
  chapterId,
}: {
  comments: CommentThread[];
  storyId: string;
  chapterId?: string;
}) {
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(comments.map((t) => [t.id, false]))
  );

  useEffect(() => {
    setOpenReplies((prev) => {
      const next = { ...prev };
      for (const t of comments) {
        if (!(t.id in next)) next[t.id] = false;
      }
      return next;
    });
  }, [comments]);

  return (
    <ul className="space-y-4">
      {comments.map((thread) => {
        const n = thread.replies.length;
        const expanded = openReplies[thread.id] ?? false;
        return (
          <li key={thread.id} className="space-y-2">
            <CommentItem
              comment={thread}
              storyId={storyId}
              chapterId={chapterId}
              framed
            />
            {n > 0 ? (
              <div className="ml-0 sm:ml-1">
                <button
                  type="button"
                  onClick={() =>
                    setOpenReplies((p) => ({
                      ...p,
                      [thread.id]: !(p[thread.id] ?? false),
                    }))
                  }
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {expanded
                    ? "Hide"
                    : `View ${n} ${n === 1 ? "reply" : "replies"}`}
                </button>
                {expanded ? (
                  <ul className="mt-2 ml-3 space-y-3 border-l border-border pl-3 sm:ml-6 sm:pl-4">
                    {thread.replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem
                          comment={reply}
                          storyId={storyId}
                          chapterId={chapterId}
                          framed={false}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
