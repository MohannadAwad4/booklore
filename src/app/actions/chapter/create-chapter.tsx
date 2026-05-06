"use server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CreateChapter(formData: FormData) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("User not authenticated");
  }
  const storyId = String(formData.get("storyId"));
  if (!storyId) throw new Error("Missing storyId");

  // Ensure ownership
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true },
  });
  if (!story || story.authorId !== user.id) {
    throw new Error("Forbidden");
  }
  // Source of truth: Chapter table
  const last = await prisma.chapter.findFirst({
    where: { storyId },
    orderBy: { chapterNumber: "desc" },
    select: { chapterNumber: true },
  });

  const nextNumber = (last?.chapterNumber ?? 0) + 1;

  const chapter = await prisma.$transaction(async (tx) => {
    const c = await tx.chapter.create({
      data: {
        storyId,
        authorId: user.id,
        chapterNumber: nextNumber,
        title: `Chapter ${nextNumber}`,
        content: "",
      },
      select: { id: true },
    });

    // Keep cached count in sync
    await tx.story.update({
      where: { id: storyId },
      data: { chaptersCount: { increment: 1 } },
    });

    return c;
  });

  redirect(`/book/${storyId}/chapters/${chapter.id}`);
}
