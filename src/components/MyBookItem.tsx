"use client";
import Image from "next/image";
import Link from "next/link";
import { StoryType } from "@/lib/types";
import { DeleteBook } from "@/app/actions/book";
import Form from "next/form";

export default function MyBookItem({ story }: { story: StoryType }) {
  const coverSrc = story.coverUrl?.trim() || "/images/default-book-cover.png"; // put this in /public/images/

  const statusLabel = String(story.status).toLowerCase();

  const statusClasses =
    story.status === "PUBLISHED"
      ? "bg-green-100 text-green-700"
      : story.status === "HIATUS"
        ? "bg-yellow-100 text-yellow-700"
        : story.status === "COMPLETE"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700";

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
      <select
        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusClasses}`}
      >
        <option value="DRAFT" selected={story.status === "DRAFT"}>
          Draft
        </option>
        <option value="PUBLISHED" selected={story.status === "PUBLISHED"}>
          Published
        </option>
        <option value="HIATUS" selected={story.status === "HIATUS"}>
          Hiatus
        </option>
        <option value="COMPLETE" selected={story.status === "COMPLETE"}>
          Complete
        </option>
      </select>
      <Form action={DeleteBook} className="inline">
        <input type="hidden" name="storyId" value={story.id} />
        <button
          type="submit"
          className="ml-4 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
        >
          Delete Book
        </button>
      </Form>
    </div>
  );
}
