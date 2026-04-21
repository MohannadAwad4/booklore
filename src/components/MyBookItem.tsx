"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GenreListItem, StoryType } from "@/lib/types";
import { DeleteBook } from "@/app/actions/book";
import { useEffect, useState } from "react";
import Form from "next/form";
import PublishBookModal from "./modals/PublishBook.modal";

export default function MyBookItem({
  story,
  genres,
}: {
  story: StoryType;
  genres: GenreListItem[];
}) {
  const router = useRouter();
  const coverSrc = story.coverUrl?.trim() || "/images/default-book-cover.png"; // put this in /public/images/
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const statusClasses =
    story.status === "PUBLISHED"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

  // prevent scrolling when the modal is open
  useEffect(() => {
    if (isPublishModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isPublishModalOpen]);

  return (
    <div>
      <Link
        href={`/book/${story.id}/chapters`}
        className="group flex gap-4 rounded-xl border p-3 hover:bg-gray-50 transition"
      >
        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
          <Image
            src={coverSrc}
            alt={`${story.title} cover`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-base font-semibold group-hover:underline">
              {story.title || "Untitled"}
            </h3>
          </div>

          {/* Optional: subtitle/description if you have it */}
          {story.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {story.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No description yet.</p>
          )}
        </div>
      </Link>

      <label
        defaultValue={story.status}
        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusClasses}`}
      >
        {story.status === "PUBLISHED" ? "Published" : "Draft"}
      </label>
      {story.status != "PUBLISHED" && (
        <button
          onClick={() => setIsPublishModalOpen((prev) => true)}
          className="ml-4 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
        >
          Publish
        </button>
      )}

      <Form action={DeleteBook} className="inline">
        <input type="hidden" name="storyId" value={story.id} />
        <button
          type="submit"
          className="ml-4 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
        >
          Delete Book
        </button>
      </Form>
      {isPublishModalOpen && (
        <PublishBookModal
          story={story}
          genres={genres}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}
    </div>
  );
}
