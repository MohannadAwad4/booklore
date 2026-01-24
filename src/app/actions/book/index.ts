"use server";

import RequireUser from "@/app/api/auth/core/require-user";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { StoryStatus } from "@prisma/client";

export async function ChangeBookStatus(formData: FormData) {
  const user = await RequireUser();
  const storyId = formData.get("bookId") as string;
  const status = formData.get("status") as StoryStatus;
  if (!storyId || !status) {
    throw new Error("Missing fields");
  }
  const story = await prisma.story.update({
    where: {
      id: storyId,
      authorId: user.id,
    },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
  return story;
}
export async function DeleteBook(formData: FormData) {
  const user = await RequireUser();
  const storyId = formData.get("storyId") as string;

  if (!storyId) {
    throw new Error("Missing bookId");
  }
   const result = await prisma.story.deleteMany({
      where: {
        id: storyId,
        authorId: user.id,
      },
    });
    if (result.count === 0) {
      throw new Error("Book not found or you do not have permission to delete it");
    }

    revalidatePath("/book/my-books");

}
