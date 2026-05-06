import type { Comment } from "@prisma/client";

export type CommentWithUser = Comment & {
  user: { username: string; displayName: string | null; avatarUrl: string | null };
  /** When present, filtered to the current user (used for "liked" UI). */
  likes?: Array<{ id: string }>;
};

export type CommentThread = CommentWithUser & {
  replies: CommentWithUser[];
};
