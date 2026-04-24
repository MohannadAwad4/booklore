"use server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function formString(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

export default async function AddChapterComment(formData: FormData) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const chapterId = formString(formData, "chapterId");
  const storyId = formString(formData, "storyId");
  const content = formString(formData, "content");
  if (!chapterId || !storyId || !content) {
    throw new Error("Missing chapterId, storyId, or content");
  }
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, storyId },
    select: { id: true },
  });
  if (!chapter) {
    throw new Error("Invalid chapter");
  }
  await prisma.comment.create({
    data: { userId: user.id, storyId, chapterId, content },
  });
  revalidatePath(`/book/${storyId}/chapters/${chapterId}`);
}

/**
 * Reply under a chapter thread (max depth 2 in the tree).
 * Replying to a first-level reply attaches to the root and prefixes `@username`.
 */
export async function replyToChapterComment(formData: FormData) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const chapterId = formString(formData, "chapterId");
  const storyId = formString(formData, "storyId");
  const parentId = formString(formData, "parentId");
  const content = formString(formData, "content");
  if (!chapterId || !storyId || !parentId || !content) {
    throw new Error("Missing fields");
  }

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, storyId },
    select: { id: true },
  });
  if (!chapter) {
    throw new Error("Invalid chapter");
  }

  const parent = await prisma.comment.findFirst({
    where: { id: parentId, storyId, chapterId },
    select: {
      id: true,
      parentId: true,
      user: { select: { username: true } },
    },
  });
  if (!parent) {
    throw new Error("Invalid parent comment");
  }

  const rootId = parent.parentId ?? parent.id;
  let body = content;
  if (parent.parentId) {
    const mention = `@${parent.user.username}`;
    if (!body.startsWith(mention)) {
      body = `${mention} ${body}`;
    }
  }

  await prisma.comment.create({
    data: {
      userId: user.id,
      storyId,
      chapterId,
      content: body,
      parentId: rootId,
    },
  });
  revalidatePath(`/book/${storyId}/chapters/${chapterId}`);
}
