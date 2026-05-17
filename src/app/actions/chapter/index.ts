"use server";

import { revalidatePath } from "next/cache";
import RequireUser from "@/app/api/auth/core/require-user";
import { prisma } from "@/lib/prisma";
import { chapterStatus, StoryStatus } from "@prisma/client";
import { chapterHasNonEmptyContent } from "@/lib/chapter-content";

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
    throw new Error(
      "Chapter not found or you do not have permission to edit it"
    );
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
export default async function SetChapterStatus(fordata: FormData) {
  const user = await RequireUser();
  const chapterId = fordata.get("chapterId") as string;
  const status = fordata.get("status") as chapterStatus;

  if (!chapterId || !status) {
    throw new Error("Missing fields");
  }

  const existing = await prisma.chapter.findFirst({
    where: { id: chapterId, authorId: user.id },
    select: {
      id: true,
      status: true,
      content: true,
      storyId: true,
      story: { select: { status: true, authorId: true } },
    },
  });

  if (!existing) {
    throw new Error("Chapter not found or unauthorized");
  }
  if (existing.story.authorId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (existing.status === chapterStatus.PUBLISHED && status !== chapterStatus.PUBLISHED) {
    throw new Error("Published chapters can’t be changed.");
  }

  if (status === chapterStatus.PUBLISHED) {
    if (!chapterHasNonEmptyContent(existing.content)) {
      throw new Error("Add chapter content before publishing.");
    }
  }

  const publishChapter =
    status === chapterStatus.PUBLISHED
      ? {
          status: chapterStatus.PUBLISHED,
          publishedAt: new Date(),
        }
      : {
          status,
          publishedAt: null as Date | null,
        };

  if (status === chapterStatus.PUBLISHED) {
    const storyWasDraft = existing.story.status !== StoryStatus.PUBLISHED;
    await prisma.$transaction(async (tx) => {
      if (storyWasDraft) {
        const storyUp = await tx.story.updateMany({
          where: { id: existing.storyId, authorId: user.id },
          data: {
            status: StoryStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        });
        if (storyUp.count !== 1) {
          throw new Error("Book not found or unauthorized");
        }
      }
      const chUp = await tx.chapter.updateMany({
        where: { id: chapterId, authorId: user.id },
        data: publishChapter,
      });
      if (chUp.count !== 1) {
        throw new Error("Chapter not found or unauthorized");
      }
    });
  } else {
    await prisma.chapter.updateMany({
      where: { id: chapterId, authorId: user.id },
      data: publishChapter,
    });
  }

  revalidatePath("/book/my-books");
  revalidatePath(`/book/${existing.storyId}/chapters`);
  revalidatePath(`/book/${existing.storyId}/chapters/${chapterId}`);

  return { count: 1 };
}

export async function DeleteChapter(formData: FormData) {
  const user = await RequireUser();
  const chapterId = String(formData.get("chapterId") || "").trim();

  if (!chapterId) {
    throw new Error("Missing chapterId");
  }

  const existing = await prisma.chapter.findFirst({
    where: { id: chapterId, authorId: user.id },
    select: { storyId: true },
  });

  if (!existing) {
    throw new Error("Chapter not found or you do not have permission to delete it");
  }

  await prisma.chapter.deleteMany({
    where: { id: chapterId, authorId: user.id },
  });

  revalidatePath("/book/my-books");
  revalidatePath(`/book/${existing.storyId}/chapters`);
}
