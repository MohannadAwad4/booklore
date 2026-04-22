"use client";

import { useState } from "react";
import Link from "next/link";
import CreateBook from "@/app/actions/book/create-book";
import CoverImageUpload from "@/components/CoverImageUpload";

export default function CreateBookForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      await CreateBook(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <>
    <button className="bg-button text-button-foreground" type="button" onClick={() => setIsOpen(true)}>Create Book</button>
    {isOpen && (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="p-6 space-y-6"
    >
     

      {/* Title */}
      <div>
        <label htmlFor="create-book-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="create-book-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="create-book-description"
          name="description"
          rows={4}
          placeholder="Short description of your book (optional)"
          className="w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-y min-h-[100px]"
        />
      </div>

      {/* {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )} */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-button text-button-foreground hover:opacity-90 disabled:opacity-60 font-medium py-3 px-4 transition"
        >
          {submitting ? "Creating…" : "Create book"}
        </button>
        <button  type="button" onClick={() => setIsOpen(false)}>Cancel</button>
      </div>
    </form>
    )}
    </>
  );
}
