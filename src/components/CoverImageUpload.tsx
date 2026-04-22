"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

export type CoverImageUploadProps = {
  name?: string;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
  disabled?: boolean;
  initialImageUrl?: string | null;
  /**
   * Fires when the user picks or clears a file. `url` is a `blob:` URL for preview only —
   * do not submit it to the server as `coverUrl` (it only exists in this browser tab).
   */
  onImageChange?: (url: string | null) => void;
};

export default function CoverImageUpload({
  name = "cover",
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 4,
  label = "Cover image",
  disabled = false,
  initialImageUrl = null,
  onImageChange,
}: CoverImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadFailed, setInitialLoadFailed] = useState(false);

  function setPreviewUrl(next: string | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    previewUrlRef.current = next;
    setPreview(next);
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    setInitialLoadFailed(false);
  }, [initialImageUrl]);

  function applyFile(file: File | undefined | null, input: HTMLInputElement) {
    setError(null);
    if (!file) {
      setPreviewUrl(null);
      setFileName(null);
      onImageChange?.(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose a PNG, JPG, or WebP image.");
      setPreviewUrl(null);
      setFileName(null);
      input.value = "";
      onImageChange?.(null);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMb}MB.`);
      setPreviewUrl(null);
      setFileName(null);
      input.value = "";
      onImageChange?.(null);
      return;
    }
    setFileName(file.name);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    onImageChange?.(blobUrl);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyFile(e.target.files?.[0], e.target);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    const input = fileInputRef.current;
    if (!file || !input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    applyFile(file, input);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500 transition-colors bg-gray-50 dark:bg-neutral-800/50 overflow-hidden min-h-[200px] flex flex-col items-center justify-center gap-2 p-6 disabled:opacity-60 disabled:pointer-events-none"
      >
        {initialImageUrl && !preview && (
          initialLoadFailed ? (
            <div className="flex max-h-40 min-h-[10rem] w-full items-center justify-center rounded-lg bg-muted">
              <BookOpen
                className="size-16 text-muted-foreground"
                strokeWidth={1.25}
                aria-hidden
              />
            </div>
          ) : (
            <img
              src={initialImageUrl}
              alt="Cover preview"
              className="max-h-40 w-auto object-contain rounded-lg"
              onError={() => setInitialLoadFailed(true)}
            />
          )
        )}
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
          </>
        ) : (
          <>
            <BookOpen
              className="size-14 text-gray-400 dark:text-gray-500"
              strokeWidth={1.25}
              aria-hidden
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              PNG, JPG or WebP (max {maxSizeMb}MB)
            </span>
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
