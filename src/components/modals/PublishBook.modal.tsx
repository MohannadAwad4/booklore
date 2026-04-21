"use client";

import { PublishBook } from "@/app/actions/book";
import type { GenreListItem, StoryType } from "@/lib/types";
import { StoryCategory, StoryStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Select, { type MultiValue } from "react-select";
import { useState } from "react";
import CoverImageUpload from "../CoverImageUpload";
import AddTags from "../AddTags";
type GenreOption = { value: string; label: string };

type CategoryOption = { value: StoryCategory; label: string };

type PublishBookModalProps = {
  story: StoryType;
  genres: GenreListItem[];
  onClose: () => void;
};
export default function PublishBookModal({
  story,
  genres,
  onClose,
}: PublishBookModalProps) {
  const router = useRouter();
  const [category, setCategory] = useState<StoryCategory>(
    () => story.storyCategory ?? StoryCategory.FICTION
  );
  const [genreSelection, setGenreSelection] = useState<MultiValue<GenreOption>>(
    () => []
  );
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  async function handlePublish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await PublishBook(formData);
      router.refresh();
      onClose();
    } catch {
      setSubmitting(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-book-title"
      >
        <h2
          id="publish-book-title"
          className="text-lg font-semibold text-foreground"
        >
          Publish Book
        </h2>
        <form
          onSubmit={handlePublish}
          encType="multipart/form-data"
          method="post"
          className="mt-3 space-y-3"
        >
          <CoverImageUpload
            label="Cover (optional)"
            initialImageUrl={story.coverUrl}
            disabled={submitting}
          />
          <div>
            <label
              htmlFor="publish-title"
              className="block text-sm font-medium"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="publish-title"
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              defaultValue={story.title}
            />
          </div>
          <div>
            <label
              htmlFor="publish-description"
              className="block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              name="description"
              id="publish-description"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              defaultValue={story.description ?? ""}
            />
          </div>
          <input type="hidden" name="bookId" value={story.id} />
          <input type="hidden" name="status" value={StoryStatus.PUBLISHED} />
          <div>
            <span className="block text-sm font-medium">Category</span>
            <input type="hidden" name="storyCategory" value={category} />
            <Select<CategoryOption, false>
              required
              isSearchable={false}
              options={[
                { value: StoryCategory.FICTION, label: "Fiction" },
                { value: StoryCategory.NON_FICTION, label: "Non-fiction" },
              ]}
              onChange={(opt) => setCategory(opt?.value as StoryCategory)}
            />
          </div>
          <div>
            <label
              htmlFor="publish-genres"
              className="block text-sm font-medium"
            >
              Genres
            </label>

            {genres.length === 0 ? null : (
              <>
                <input
                  type="hidden"
                  name="genres"
                  value={genreSelection.map((g) => g.value).join(",")}
                />
                <Select<GenreOption, true>
                  required
                  closeMenuOnSelect={false}
                  isMulti
                  options={genres.map((genre) => ({
                    value: genre.id,
                    label: genre.name,
                  }))}
                  onChange={(opts) => setGenreSelection(opts ?? [])}
                  className="mt-2"
                />
              </>
            )}
            <input type="hidden" name="tags" value={tags.join(",")} />
            <AddTags tags={tags} setTags={setTags} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
