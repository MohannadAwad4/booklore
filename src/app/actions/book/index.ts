"use server";

import RequireUser from "@/app/api/auth/core/require-user";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { StoryCategory, StoryStatus } from "@prisma/client";
import { saveCoverFromUpload } from "./cover-upload";

function normalizeTagName(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function PublishBook(formData: FormData) {
  const user = await RequireUser();

  const storyId = formData.get("bookId") as string;
  const status = formData.get("status") as StoryStatus;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const genreIds = String(formData.get("genres") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const tagNames = String(formData.get("tags") ?? "")
    .split(",")
    .map((s) => normalizeTagName(s))
    .filter(Boolean);

  const storyCategoryRaw = formData.get("storyCategory") as string | null;
  const storyCategory =
    storyCategoryRaw === StoryCategory.NON_FICTION
      ? StoryCategory.NON_FICTION
      : StoryCategory.FICTION;

  if (!storyId || !status || !title) {
    throw new Error("Missing fields");
  }

  const story = await prisma.story.findFirst({
    where: {
      id: storyId,
      authorId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!story) {
    throw new Error("Book not found or unauthorized");
  }

  const coverFile = formData.get("cover") as File | null;
  const coverUrl = await saveCoverFromUpload(storyId, coverFile);

  await prisma.$transaction(async (tx) => {
    await tx.story.update({
      where: {
        id: storyId,
      },
      data: {
        title,
        description,
        storyCategory,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        ...(coverUrl ? { coverUrl } : {}),
      },
    });

    await tx.storyGenre.deleteMany({
      where: {
        storyId,
      },
    });

    if (genreIds.length > 0) {
      const validGenres = await tx.genre.findMany({
        where: {
          id: {
            in: genreIds,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.storyGenre.createMany({
        data: validGenres.map((genre) => ({
          storyId,
          genreId: genre.id,
        })),
        skipDuplicates: true,
      });
    }

    await tx.storyTag.deleteMany({
      where: { storyId },
    });

    const uniqueTagNames = [...new Set(tagNames)];
    if (uniqueTagNames.length > 0) {
      const resolvedTags = await Promise.all(
        uniqueTagNames.map((name) =>
          tx.tag.upsert({
            where: { name },
            create: { name },
            update: {},
            select: { id: true },
          })
        )
      );

      await tx.storyTag.createMany({
        data: resolvedTags.map((tag) => ({
          storyId,
          tagId: tag.id,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidatePath("/book/my-books");
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
    throw new Error(
      "Book not found or you do not have permission to delete it"
    );
  }

  revalidatePath("/book/my-books");
}

export async function BookMarkBook(formData: FormData) {
  const user = await RequireUser();
  const storyId = formData.get("storyId") as string;

  if (!storyId) {
    throw new Error("Missing storyId");
  }

  const story = await prisma.story.findFirst({
    where: { id: storyId, status: StoryStatus.PUBLISHED },
    select: { id: true },
  });
  if (!story) {
    throw new Error("Book not found");
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_storyId: { userId: user.id, storyId },
    },
  });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      const row = await tx.story.findUniqueOrThrow({
        where: { id: storyId },
        select: { bookmarksCount: true },
      });
      await tx.bookmark.delete({ where: { id: existing.id } });
      await tx.story.update({
        where: { id: storyId },
        data: {
          bookmarksCount: Math.max(0, row.bookmarksCount - 1),
        },
      });
    });
    revalidatePath(`/user/${user.id}`);
    revalidatePath(`/book/${storyId}/chapters`);
    return { bookmarked: false as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.bookmark.create({
      data: { userId: user.id, storyId },
    });
    await tx.story.update({
      where: { id: storyId },
      data: { bookmarksCount: { increment: 1 } },
    });
  });

  revalidatePath(`/user/${user.id}`);
  revalidatePath(`/book/${storyId}/chapters`);
  return { bookmarked: true as const };
}

export async function LikeStory(formData: FormData) {
  const user = await RequireUser();
  const storyId = formData.get("storyId") as string;
  if (!storyId) {
    throw new Error("Missing storyId");
  }
  const story = await prisma.story.findFirst({
    where: { id: storyId, status: StoryStatus.PUBLISHED },
    select: { id: true },
  });
  if (!story) {
    throw new Error("Story not found");
  }
  const existing = await prisma.storyLike.findUnique({
    where: { userId_storyId: { userId: user.id, storyId } },
  });
  if (existing) {
    await prisma.$transaction(async (tx) => {
      const row = await tx.story.findUniqueOrThrow({
        where: { id: storyId },
        select: { likesCount: true },
      });
      await tx.storyLike.delete({ where: { id: existing.id } });
      await tx.story.update({
        where: { id: storyId },
        data: {
          likesCount: Math.max(0, row.likesCount - 1),
        },
      });
    });
    revalidatePath(`/user/${user.id}`);
    revalidatePath(`/book/${storyId}/chapters`);
    return { liked: false as const };
  }
  await prisma.$transaction(async (tx) => {
    await tx.storyLike.create({
      data: { userId: user.id, storyId },
    });
    await tx.story.update({
      where: { id: storyId },
      data: { likesCount: { increment: 1 } },
    });
  });

  revalidatePath(`/user/${user.id}`);
  revalidatePath(`/book/${storyId}/chapters`);
  return { liked: true as const };
}
