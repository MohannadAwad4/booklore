"use client";

import { useState } from "react";
import CreateBookAction from "@/app/actions/book/create-book";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CreateBook() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setTitle("");
      setError(null);
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      await CreateBookAction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        className="bg-button text-button-foreground"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Create Book
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton className="max-w-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a new book</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-6 p-6 pt-0"
          >
            {/* Title */}
            <div>
              <label
                htmlFor="create-book-title"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="create-book-title"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter book title"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="create-book-description"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="create-book-description"
                name="description"
                rows={4}
                placeholder="Short description of your book (optional)"
                className="min-h-[100px] w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )} */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-button px-4 py-3 font-medium text-button-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create book"}
              </button>
              <button type="button" onClick={() => handleOpenChange(false)}>
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
