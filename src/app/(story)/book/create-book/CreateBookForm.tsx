"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import CreateBook from "@/app/actions/book/create-book";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const MAX_SIZE_MB = 4;

export default function CreateBookForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose a PNG, JPG, or WebP image.");
      setPreview(null);
      setFileName(null);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`);
      setPreview(null);
      setFileName(null);
      e.target.value = "";
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="p-6 space-y-6"
    >
      {/* Cover upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cover image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          name="cover"
          accept={ACCEPT}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500 transition-colors bg-gray-50 dark:bg-neutral-800/50 overflow-hidden min-h-[200px] flex flex-col items-center justify-center gap-2 p-6"
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Cover preview"
                className="max-h-40 w-auto object-contain rounded-lg"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-full">
                {fileName}
              </span>
              <span className="text-xs text-gray-500">Click or drop a new image to replace</span>
            </>
          ) : (
            <>
              <span className="text-4xl text-gray-400 dark:text-gray-500" aria-hidden>📖</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG or WebP (max {MAX_SIZE_MB}MB)
              </span>
            </>
          )}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="create-book-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="create-book-title"
          type="text"
          name="title"
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

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-3 px-4 transition"
        >
          {submitting ? "Creating…" : "Create book"}
        </button>
        <Link
          href="/book/my-books"
          className="rounded-lg border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
