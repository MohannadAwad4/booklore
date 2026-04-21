// lib/types/story.ts
import { Prisma } from "@prisma/client";

export type StoryType = Prisma.StoryGetPayload<{
  select: {
    id: true;
    title: true;
    status: true;
    authorId: true;
    updatedAt: true;
    coverUrl: true;
    description: true;
    publishedAt: true;
    createdAt: true;
    storyCategory: true;
  };
}>;

export type ChapterType = Prisma.ChapterGetPayload<{
  select: {
    id: true;
    title: true;
    status: true;
    authorId: true;
    updatedAt: true;
    publishedAt: true;
    content: true;
    storyId: true;
    chapterNumber: true;
    createdAt: true;
  };
}>;
/** Genres as loaded from the DB for pickers (not the static seed list). */
export type GenreListItem = Prisma.GenreGetPayload<{
  select: { id: true; name: true; slug: true };
}>;
