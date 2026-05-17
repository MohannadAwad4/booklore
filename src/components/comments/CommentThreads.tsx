"use client";

import type { CommentThread } from "@/lib/comment-thread";
import CommentItem from "@/components/items/CommentItem";
import { useEffect, useState } from "react";

/** Book-level (`chapterId` omitted) or chapter-level threaded comments. */
export default function CommentThreads({
  comments,
}: {
  comments: CommentThread[];
}) {
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(comments.map((t) => [t.id, false])),
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
              framed
              viewReplies={
                n > 0
                  ? {
                      count: n,
                      expanded,
                      onToggle: () =>
                        setOpenReplies((p) => ({
                          ...p,
                          [thread.id]: !(p[thread.id] ?? false),
                        })),
                    }
                  : undefined
              }
              onReplySuccess={() =>
                setOpenReplies((p) => ({ ...p, [thread.id]: true }))
              }
            />
            {expanded && n > 0 ? (
              <ul className="ml-3 space-y-3 border-l border-border pl-3 sm:ml-6 sm:pl-4">
                {thread.replies.map((reply) => (
                  <li key={reply.id}>
                    <CommentItem comment={reply} framed={false} />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
