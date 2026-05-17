/** Client-safe enum values — keep in sync with prisma/schema.prisma */

export const chapterStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  SCHEDULED: "SCHEDULED",
} as const;

export const StoryStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export const StoryCategory = {
  FICTION: "FICTION",
  NON_FICTION: "NON_FICTION",
} as const;

export const StoryProgress = {
  ONGOING: "ONGOING",
  HIATUS: "HIATUS",
  COMPLETE: "COMPLETE",
} as const;

export type ChapterStatusValue =
  (typeof chapterStatus)[keyof typeof chapterStatus];
export type StoryStatusValue =
  (typeof StoryStatus)[keyof typeof StoryStatus];
export type StoryCategoryValue =
  (typeof StoryCategory)[keyof typeof StoryCategory];
export type StoryProgressValue =
  (typeof StoryProgress)[keyof typeof StoryProgress];
