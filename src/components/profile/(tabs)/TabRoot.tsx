"use client";

import type { Story } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BookCard from "@/components/cards/BookCard";

type TabRootProps = {
  tabData: Story[];
  viewerUserId: string | null;
  bookmarkedStoryIds: string[];
  likedStoryIds: string[];
};

const tabs = [
  { id: "my-books", label: "My Books" },
  { id: "liked-books", label: "Liked Books" },
  { id: "bookmarked", label: "Bookmarked" },
] as const;

export default function TabRoot({
  tabData,
  viewerUserId,
  bookmarkedStoryIds,
  likedStoryIds,
}: TabRootProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "my-books";

  const handleTabClick = (tabId: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("tab", tabId);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };
const emptyMessage = () => {
    switch (activeTab) {
        case "my-books":
            return "No books found";
        case "liked-books":
            return "No books liked";
        case "bookmarked":
            return "No books bookmarked";
    }
}
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={
              activeTab === tab.id
                ? "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
       {tabData.length > 0 ? tabData.map((story) => (
        <BookCard
          key={story.id}
          story={story}
          viewerUserId={viewerUserId}
          initialBookmarked={bookmarkedStoryIds.includes(story.id)}
          initialLiked={likedStoryIds.includes(story.id)}
        />
      )) : <div className="text-sm text-muted-foreground">{emptyMessage()}</div>}
      </div>
    </div>
  );
}
