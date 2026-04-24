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

/** Top-level comment on the book (chapters list), not tied to a chapter. */
export default async function AddBookComment(formData: FormData) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const storyId = formString(formData, "storyId");
  const content = formString(formData, "content");
  if (!storyId || !content) {
    throw new Error("Missing storyId or content");
  }
  await prisma.comment.create({
    data: { userId: user.id, storyId, content },
  });
  revalidatePath(`/book/${storyId}/chapters`);
}

/**
 * Reply under a book-level thread (max depth 2 in the tree).
 * Replying to a first-level reply attaches to the root and prefixes `@username`.
 */
export async function replyToBookComment(formData: FormData) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const storyId = formString(formData, "storyId");
  const parentId = formString(formData, "parentId");
  const content = formString(formData, "content");
  if (!storyId || !parentId || !content) {
    throw new Error("Missing storyId, parentId, or content");
  }

  const parent = await prisma.comment.findFirst({
    where: { id: parentId, storyId, chapterId: null },
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
      content: body,
      parentId: rootId,
    },
  });
  revalidatePath(`/book/${storyId}/chapters`);
}
