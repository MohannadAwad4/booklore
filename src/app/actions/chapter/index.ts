"use server";

import { revalidatePath } from "next/cache";
import RequireUser from "@/app/api/auth/core/require-user";
import { prisma } from "@/lib/prisma";

export type UpdateChapterState =
  | { ok: true; title: string }
  | { ok: false; error: string }
  | null;

export async function SaveChapterContent(chapterId: string, content: string) {
  const user = await RequireUser();
  if (!chapterId?.trim()) {
    throw new Error("Missing chapterId");
  }
  const updated = await prisma.chapter.updateMany({
    where: {
      id: chapterId,
      authorId: user.id,
    },
    data: {
      content: content ?? "",
      updatedAt: new Date(),
    },
  });
  if (updated.count === 0) {
    throw new Error("Chapter not found or you do not have permission to edit it");
  }
}

export async function UpdateChapter(
  _prevState: UpdateChapterState,
  formData: FormData
): Promise<UpdateChapterState> {
  const user = await RequireUser();
  const chapterId = String(formData.get("chapterId") || "");
  const title = String(formData.get("title") || "").trim();

  if (!chapterId || !title) {
    return { ok: false, error: "Missing fields" };
  }

  const updated = await prisma.chapter.updateMany({
    where: { id: chapterId, authorId: user.id },
    data: { title },
  });

  if (updated.count === 0) {
    return { ok: false, error: "Not found / no permission" };
  }

  revalidatePath("/book/[storyId]/chapters/[chapterId]", "page");

  return { ok: true, title };
}
