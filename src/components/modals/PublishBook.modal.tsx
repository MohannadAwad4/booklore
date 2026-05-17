"use client";

import { PublishBook } from "@/app/actions/book";
import type { GenreListItem, StoryType } from "@/lib/types";
import { StoryCategory, StoryStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Select, { type MultiValue } from "react-select";
import { useRef, useState } from "react";
import { BookMarked } from "lucide-react";
import CoverImageUpload from "../CoverImageUpload";
import AddTags from "../AddTags";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GenreOption = { value: string; label: string };

type CategoryOption = { value: StoryCategory; label: string };

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: StoryCategory.FICTION, label: "Fiction" },
  { value: StoryCategory.NON_FICTION, label: "Non-fiction" },
];

const inputClass =
  "mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "text-sm font-medium text-foreground";

const publishTriggerClass =
  "rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-500/25 disabled:pointer-events-none disabled:opacity-50 dark:text-emerald-300";

type PublishBookModalProps = {
  story: StoryType;
  genres: GenreListItem[];
};

export default function PublishBookModal({ story, genres }: PublishBookModalProps) {
  const router = useRouter();
  const dismissRef = useRef<HTMLButtonElement>(null);
  const [category, setCategory] = useState<StoryCategory>(
    () => story.storyCategory ?? StoryCategory.FICTION
  );
  const [genreSelection, setGenreSelection] = useState<MultiValue<GenreOption>>(
    () => []
  );
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  function resetDraftFields() {
    setGenreSelection([]);
    setTags([]);
    setCategory(story.storyCategory ?? StoryCategory.FICTION);
  }

  async function handlePublish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await PublishBook(formData);
      router.refresh();
      toast.success("Book published", { position: "top-center" });
      setSubmitting(false);
      dismissRef.current?.click();
    } catch (error) {
      setSubmitting(false);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        { position: "top-center" }
      );
    }
  }

  const categoryValue =
    CATEGORY_OPTIONS.find((o) => o.value === category) ?? CATEGORY_OPTIONS[0];

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) resetDraftFields();
      }}
    >
      <DialogTrigger asChild>
        <button type="button" className={publishTriggerClass}>
          Publish
        </button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        className={cn(
          "max-h-[85vh] max-w-lg gap-0 overflow-y-auto p-0 sm:max-w-lg",
          "border-border/80 shadow-lg"
        )}
      >
        <DialogClose asChild>
          <button
            ref={dismissRef}
            type="button"
            tabIndex={-1}
            className="sr-only"
            aria-hidden
          >
            Close dialog
          </button>
        </DialogClose>
        <DialogHeader className="flex flex-row items-start gap-3 border-b border-border/60 bg-muted/25 px-5 py-4 sm:px-6">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border/80"
            aria-hidden
          >
            <BookMarked className="size-[1.15rem]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 space-y-1 pt-0.5">
            <DialogTitle className="text-balance font-heading text-lg leading-tight sm:text-xl">
              Publish book
            </DialogTitle>
            <DialogDescription className="text-pretty text-[0.8125rem] leading-relaxed sm:text-sm">
              Share your story to the world!
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          onSubmit={handlePublish}
          encType="multipart/form-data"
          method="post"
          className="space-y-4 px-5 py-4 sm:px-6 sm:py-5"
        >
          <CoverImageUpload
            label="Cover (optional)"
            initialImageUrl={story.coverUrl}
            disabled={submitting}
          />

          <div>
            <label htmlFor="publish-title" className={labelClass}>
              Title
            </label>
            <input
              type="text"
              name="title"
              id="publish-title"
              required
              disabled={submitting}
              placeholder="Story title"
              className={inputClass}
              defaultValue={story.title}
            />
          </div>

          <div>
            <label htmlFor="publish-description" className={labelClass}>
              Description
            </label>
            <textarea
              name="description"
              id="publish-description"
              required
              rows={4}
              disabled={submitting}
              placeholder="Hook readers in a few lines — the premise, the voice, and what makes this story worth their time."
              className={cn(inputClass, "min-h-[5.5rem] resize-y")}
              defaultValue={story.description ?? ""}
            />
          </div>

          <input type="hidden" name="bookId" value={story.id} />
          <input type="hidden" name="status" value={StoryStatus.PUBLISHED} />
          <input type="hidden" name="storyCategory" value={category} />

          <div>
            <span className={labelClass}>Category</span>
            <div className="mt-1.5">
              <Select<CategoryOption, false>
                isDisabled={submitting}
                isSearchable={false}
                options={CATEGORY_OPTIONS}
                value={categoryValue}
                onChange={(opt) =>
                  setCategory(
                    (opt?.value as StoryCategory) ?? StoryCategory.FICTION
                  )
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="publish-genres" className={labelClass}>
              Genres
            </label>
            {genres.length === 0 ? (
              <p className="mt-1.5 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                No genres available — you can still publish; an admin can add
                genres later.
              </p>
            ) : (
              <>
                <input
                  type="hidden"
                  name="genres"
                  value={genreSelection.map((g) => g.value).join(",")}
                />
                <Select<GenreOption, true>
                  inputId="publish-genres"
                  isDisabled={submitting}
                  closeMenuOnSelect={false}
                  isMulti
                  placeholder="Choose genres…"
                  options={genres.map((genre) => ({
                    value: genre.id,
                    label: genre.name,
                  }))}
                  value={genreSelection}
                  onChange={(opts) => setGenreSelection(opts ?? [])}
                  className="mt-1.5"
                />
              </>
            )}
          </div>

          <input type="hidden" name="tags" value={tags.join(",")} />
          <div>
            <span className={cn(labelClass, "mb-1.5 block")}>Tags</span>
            <AddTags tags={tags} setTags={setTags} />
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
            <DialogClose asChild>
              <button
                type="button"
                disabled={submitting}
                className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-button px-3.5 py-2 text-sm font-medium text-button-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
