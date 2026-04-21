"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoryCategory, StoryProgress } from "@prisma/client";
import type { GenreListItem } from "@/lib/types";
import { categoryOptions, progressOptions } from "@/lib/options";
import Select, { MultiValue } from "react-select";
export default function FilterSection({ genres }: { genres: GenreListItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StoryCategory | null>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [genreSelection, setGenreSelection] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const router = useRouter();
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !search.trim() &&
      !category &&
      !progress &&
      genreSelection.length === 0
    ) {
      router.push("/");
      return;
    }
    const sp = new URLSearchParams();
    if (search.trim()) sp.set("q", search.trim());
    if (category) sp.set("category", category.toLocaleLowerCase());
    if (progress) sp.set("progress", progress.toLocaleLowerCase());
    const base = sp.toString();
    let url = base ? `/?${base}` : "/";
    if (genreSelection.length > 0) {
      const genres = genreSelection.map((g) => g.value).join(",");
      url += `${base ? "&" : "?"}genres=${genres}`;
    }
    router.push(url);
  };
  return (
    <form onSubmit={handleSearch}>
      <div>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </div>
      <div>
        <Select
          instanceId="feed-filter-category"
          isClearable
          options={categoryOptions}
          value={
            category
              ? (categoryOptions.find((o) => o.value === category) ?? null)
              : null
          }
          onChange={(opt) =>
            setCategory(opt ? (opt.value as StoryCategory) : null)
          }
        />
      </div>
      <div>
        <Select
          instanceId="feed-filter-progress"
          isClearable
          options={progressOptions}
          value={
            progress
              ? (progressOptions.find((o) => o.value === progress) ?? null)
              : null
          }
          onChange={(opt) =>
            setProgress(opt ? (opt.value as StoryProgress) : null)
          }
        />
      </div>
      <div>
        <Select
          instanceId="feed-filter-genres"
          isMulti
          isClearable
          options={genres.map((genre) => ({
            value: genre.slug,
            label: genre.name,
          }))}
          value={genreSelection}
          onChange={(opts) => setGenreSelection(opts ?? [])}
        />
      </div>
      <button type="submit">Filter</button>
    </form>
  );
}
