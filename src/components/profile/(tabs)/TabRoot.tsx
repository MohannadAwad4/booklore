"use client";

import type { Story } from "@prisma/client";
import { Bookmark, Book, Heart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BookCard from "@/components/cards/BookCard";
import { cn } from "@/lib/utils";

type TabRootProps = {
  tabData: Story[];
  viewerUserId: string | null;
  bookmarkedStoryIds: string[];
  likedStoryIds: string[];
};

const tabs = [
  { id: "my-books", label: "My Books", Icon: Book },
  { id: "liked-books", label: "Liked Books", Icon: Heart },
  { id: "bookmarked", label: "Bookmarked", Icon: Bookmark },
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
  };
  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-x-8 gap-y-1 border-b border-border"
        role="tablist"
        aria-label="Profile collections"
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(id)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="size-4 shrink-0"
                strokeWidth={1.75}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        {tabData.length > 0 ? (
          tabData.map((story) => (
            <BookCard
              key={story.id}
              story={story}
              viewerUserId={viewerUserId}
              initialBookmarked={bookmarkedStoryIds.includes(story.id)}
              initialLiked={likedStoryIds.includes(story.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-sm text-muted-foreground">
            {emptyMessage()}
          </div>
        )}
      </div>
    </div>
  );
}
