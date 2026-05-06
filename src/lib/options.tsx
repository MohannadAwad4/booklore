import { StoryCategory, StoryProgress } from "@prisma/client";

export const categoryOptions = [
  { value: StoryCategory.FICTION, label: "Fiction" },
  { value: StoryCategory.NON_FICTION, label: "Non-fiction" },
];
export const progressOptions = [
  { value: StoryProgress.ONGOING, label: "Ongoing" },
  { value: StoryProgress.HIATUS, label: "Hiatus" },
  { value: StoryProgress.COMPLETE, label: "Complete" },
];
