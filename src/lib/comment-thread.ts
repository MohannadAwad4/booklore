import type { Comment } from "@prisma/client";

export type CommentWithUser = Comment & {
  user: { username: string; displayName: string | null };
};

export type CommentThread = CommentWithUser & {
  replies: CommentWithUser[];
};
