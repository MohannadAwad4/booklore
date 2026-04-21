"use server";

import { redirect } from "next/navigation";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import { saveCoverFromUpload } from "./cover-upload";

export default async function CreateBook(formData: FormData) {
  const user = await GetUserSession();
  if (!user)
    throw new Error("Unauthorised. Please log in before creating a book.");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? null;
  if (!title) throw new Error("Title is required.");

  const story = await prisma.story.create({
    data: {
      authorId: user.id,
      storyType: "BOOK",
      title,
      description,
    },
  });

  const coverFile = formData.get("cover") as File | null;
  const coverUrl = await saveCoverFromUpload(story.id, coverFile);
  if (coverUrl) {
    await prisma.story.update({
      where: { id: story.id },
      data: { coverUrl },
    });
  }

  redirect(`/book/${story.id}/chapters`);
}
