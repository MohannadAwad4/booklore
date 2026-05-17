"use client";

import { DeleteBook } from "@/app/actions/book";
import { AreYouSure } from "@/components/modals/ToastIndex";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteBookButton({
  storyId,
  title,
  isPublished,
}: {
  storyId: string;
  title: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete() {
    const message = isPublished
      ? `Delete “${title}”? This published book and its chapters will be removed permanently.`
      : `Delete “${title}”? This cannot be undone.`;

    AreYouSure({
      message,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const formData = new FormData();
          formData.set("storyId", storyId);
          await DeleteBook(formData);
          toast.success("Book deleted", { position: "top-center" });
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Something went wrong",
            { position: "top-center" },
          );
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete “${title}”`}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-red-600 transition hover:bg-red-500/15 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300"
    >
      <Trash2 className="size-4" strokeWidth={2} aria-hidden />
    </button>
  );
}
