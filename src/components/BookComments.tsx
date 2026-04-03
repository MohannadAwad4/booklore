"use client";

import { Comment } from "@prisma/client";

type CommentWithUser = Comment & {
  user: { username: string; displayName: string | null };
};

export default function BookComments({
  comments,
  storyId,
}: {
  comments: CommentWithUser[];
  storyId: string;
}) {
  return (
    <div>
      <ul className="space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              {comment.user.username}:
            </span>
            <span>{comment.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
    