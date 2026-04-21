"use server";

import RequireUser from "@/app/api/auth/core/require-user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveCoverFromUpload } from "../cover-upload";

function revalidateBookPaths(storyId: string) {
  revalidatePath("/book/my-books");
  revalidatePath(`/book/${storyId}/chapters`);
  revalidatePath("/book/feed-books");
}

async function assertAuthorStory(userId: string, storyId: string) {
  const story = await prisma.story.findFirst({
    where: { id: storyId, authorId: userId },
    select: { id: true },
  });
  if (!story) {
    throw new Error("Book not found or unauthorized");
  }
}

/** Author-only: update description / blurb only. */
export async function UpdateBookDescription(formData: FormData) {
  const user = await RequireUser();
  const storyId = formData.get("storyId") as string;
  const descriptionRaw = formData.get("description");

  if (!storyId) {
    throw new Error("Missing storyId");
  }
  if (typeof descriptionRaw !== "string") {
    throw new Error("Missing description");
  }
  const description =
    descriptionRaw.trim() === "" ? null : descriptionRaw.trim();

  await assertAuthorStory(user.id, storyId);

  await prisma.story.update({
    where: { id: storyId },
    data: { description },
  });

  revalidateBookPaths(storyId);
}

/** Author-only: replace cover image (same rules as publish). */
export async function UpdateBookCover(formData: FormData) {
  const user = await RequireUser();
  const storyId = formData.get("storyId") as string;
  if (!storyId) {
    throw new Error("Missing storyId");
  }

  await assertAuthorStory(user.id, storyId);

  const coverFile = formData.get("cover") as File | null;
  const coverUrl = await saveCoverFromUpload(storyId, coverFile);
  if (!coverUrl) {
    throw new Error("Missing cover file");
  }

  await prisma.story.update({
    where: { id: storyId },
    data: { coverUrl },
  });

  revalidateBookPaths(storyId);
}
