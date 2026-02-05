"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoryType } from "@/lib/types";
import { DeleteBook, ChangeBookStatus } from "@/app/actions/book";
import Form from "next/form";

export default function MyBookItem({ story }: { story: StoryType }) {
  const router = useRouter();
  const coverSrc = story.coverUrl?.trim() || "/images/default-book-cover.png"; // put this in /public/images/

  const statusClasses =
    story.status === "PUBLISHED"
      ? "bg-green-100 text-green-700"
      : story.status === "HIATUS"
        ? "bg-yellow-100 text-yellow-700"
        : story.status === "COMPLETE"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700";

  async function handleStatusSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await ChangeBookStatus(formData);
    router.refresh();
  }

  async function handleDeleteSubmit(formData: FormData) {
    await DeleteBook(formData);
    router.refresh();
  }

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
      <form onSubmit={handleStatusSubmit} className="inline">
        <input type="hidden" name="bookId" value={story.id} />
        <select
          name="status"
          defaultValue={story.status}
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusClasses}`}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="HIATUS">Hiatus</option>
          <option value="COMPLETE">Complete</option>
        </select>
        <button type="submit" className="ml-4 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200">Submit</button>
      </form>
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
