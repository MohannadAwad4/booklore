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
    description
  };
}>;
