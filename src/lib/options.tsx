import { StoryCategory, StoryProgress, StoryType } from "@/lib/enums";

export const categoryOptions = [
  { value: StoryCategory.FICTION, label: "Fiction" },
  { value: StoryCategory.NON_FICTION, label: "Non-fiction" },
];
export const storyTypeOptions = [
  { value: StoryType.BOOK, label: "Book" },
  { value: StoryType.COMIC, label: "Comic" },
  { value: StoryType.SHORT_STORY, label: "Short story" },
  { value: StoryType.POEM, label: "Poem" },
  { value: StoryType.SCREENPLAY, label: "Screenplay" },
  
];
export const progressOptions = [
  { value: StoryProgress.ONGOING, label: "Ongoing" },
  { value: StoryProgress.HIATUS, label: "Hiatus" },
  { value: StoryProgress.COMPLETE, label: "Complete" },
];
