"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ParsedBook } from "@/lib/book-import/parse-book";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function previewSnippet(html: string, max = 220): string {
  const t = stripHtml(html);
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function ImportBook() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState<ParsedBook | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    setError(null);
    setPreview(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/import/book/preview", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to parse file",
        );
      }
      setPreview(data as ParsedBook);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsParsing(false);
      e.target.value = "";
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/import/book/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to save book",
        );
      }
      const storyId = (data as { storyId?: string }).storyId;
      setPreview(null);
      if (storyId) {
        router.push(`/book/${storyId}/chapters`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isParsing || isSaving;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Choose a file</label>
        <input
          type="file"
          accept=".docx,.md,.html,.htm,.txt"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={busy}
          aria-busy={busy}
        />
        {isParsing && (
          <p className="text-sm text-muted-foreground">Parsing file…</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Preview
            </h3>
            <p className="text-lg font-semibold mt-1">{preview.title}</p>
            {preview.description && (
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                {preview.description}
              </p>
            )}
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {preview.chapters.map((ch, i) => (
              <li key={i} className="pl-1">
                <span className="font-medium">{ch.title}</span>
                <p className="text-muted-foreground mt-0.5 pl-6 text-xs leading-relaxed">
                  {previewSnippet(ch.html)}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">
            {preview.chapters.length} chapter
            {preview.chapters.length === 1 ? "" : "s"} — nothing is saved until
            you confirm.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving…" : "Save to my library"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
