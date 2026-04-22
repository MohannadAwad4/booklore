"use server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AddChapterComment(formData: FormData) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const chapterId = formData.get("chapterId") as string;
  const storyId = formData.get("storyId") as string;
  const content = formData.get("content") as string;
  if (!chapterId || !storyId || !content) {
    throw new Error("Missing chapterId or content");
  }
  await prisma.comment.create({
    data: { userId: user.id, storyId, chapterId, content },
  });
  revalidatePath(`/book/${storyId}/chapters/${chapterId}`);
}
