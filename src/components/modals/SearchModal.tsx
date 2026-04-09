"use client";

import useDebounce from "@/hooks/useDebounce";
import { Story } from "@prisma/client";
import { useState } from "react";
import SearchCard from "../cards/SearchCard";

type SearchModalProps = {
  onClose: () => void;
  stories: Story[];
};

export default function SearchModal({ onClose, stories }: SearchModalProps) {
  const [search, setSearch] = useState("");
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  console.log("filteredStories", filteredStories);
  const handleSearch = useDebounce((value: string) => {
    const trimmedValue = value.trim().toLowerCase();

    if (!trimmedValue) {
      setFilteredStories([]);
      return;
    }

    const filtered = stories.filter((story) =>
      story.title.toLowerCase().includes(trimmedValue)
    );

    setFilteredStories(filtered);
  }, 300);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-background p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <input
          type="text"
          placeholder="Search Books"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            handleSearch(value);
          }}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          autoFocus
        />
        <div className="mt-4 space-y-2">
         {filteredStories.length === 0 && search.length > 0 && <p>No stories found</p>}
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <SearchCard story={story} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
