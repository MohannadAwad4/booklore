"use server";

import RequireUser from "@/app/api/auth/core/require-user";
import { prisma } from "@/lib/prisma";
import { StoryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

function revalidateCommentPaths(comment: {
  storyId: string;
  chapterId: string | null;
}) {
  revalidatePath(`/book/${comment.storyId}/chapters`);
  if (comment.chapterId) {
    revalidatePath(`/book/${comment.storyId}/chapters/${comment.chapterId}`);
  }
}

/** Toggle like on a comment (published stories only). */
export async function addLikeComment(formData: FormData) {
  const user = await RequireUser();
  const commentId = formData.get("commentId") as string;
  if (!commentId) {
    throw new Error("Missing commentId");
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId },
    select: {
      id: true,
      storyId: true,
      chapterId: true,
      story: { select: { status: true } },
    },
  });

  if (!comment || comment.story.status !== StoryStatus.PUBLISHED) {
    throw new Error("Comment not found");
  }

  const existing = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: { userId: user.id, commentId },
    },
  });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      const row = await tx.comment.findUniqueOrThrow({
        where: { id: commentId },
        select: { likesCount: true },
      });
      await tx.commentLike.delete({ where: { id: existing.id } });
      await tx.comment.update({
        where: { id: commentId },
        data: { likesCount: Math.max(0, row.likesCount - 1) },
      });
    });
    revalidateCommentPaths(comment);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.commentLike.create({
      data: { userId: user.id, commentId },
    });
    await tx.comment.update({
      where: { id: commentId },
      data: { likesCount: { increment: 1 } },
    });
  });

  revalidateCommentPaths(comment);
 return;
}
