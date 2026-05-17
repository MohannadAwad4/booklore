"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Library } from "lucide-react";
import type { ParsedBook } from "@/lib/book-import/parse-book";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FILE_INPUT_ID = "import-book-file-input";

const importTriggerClass =
  "inline-flex h-9 cursor-pointer select-none items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted";

/** Warm cream shell; dark mode uses ink-warm stone. */
const modalShell =
  "flex h-[min(70vh,600px)] w-full max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl ring-1 ring-stone-300/50 sm:max-w-xl " +
  "bg-[#f4f0e8] text-stone-900 dark:bg-[#171512] dark:text-stone-100 dark:ring-stone-600/40";

const modalHeader =
  "shrink-0 border-b border-stone-300/60 bg-white/70 px-6 py-4 dark:border-stone-700/80 dark:bg-stone-900/90";

const chapterScroll =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6";

const chapterCard =
  "rounded-xl border border-stone-300/40 bg-white/70 p-3 shadow-sm dark:border-stone-700/50 dark:bg-stone-800/40";

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
          typeof data.error === "string" ? data.error : "Failed to parse file"
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
          typeof data.error === "string" ? data.error : "Failed to save book"
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
      <div className="inline-flex shrink-0">
        <input
          id={FILE_INPUT_ID}
          type="file"
          accept=".docx,.md,.html,.htm,.txt"
          className="sr-only"
          onChange={handleFileChange}
          disabled={busy}
          aria-busy={busy}
        />
        <label
          htmlFor={FILE_INPUT_ID}
          className={cn(
            importTriggerClass,
            busy && "pointer-events-none cursor-not-allowed opacity-50"
          )}
        >
          <FolderOpen className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          Import Book
        </label>
      </div>

      {isParsing && (
        <p className="text-sm text-muted-foreground">Parsing file…</p>
      )}

      {error && !preview && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
        <DialogContent showCloseButton className={cn(modalShell)}>
          {preview ? (
            <>
              <DialogHeader className={modalHeader}>
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-stone-600 shadow-sm ring-1 ring-stone-300/50 dark:bg-stone-800/80 dark:text-stone-300 dark:ring-stone-600/60"
                    aria-hidden
                  >
                    <Library className="size-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
                      Import preview · {preview.chapters.length} chapter
                      {preview.chapters.length === 1 ? "" : "s"}
                    </p>
                    <DialogTitle className="text-balance font-heading text-xl leading-tight text-stone-900 sm:text-2xl dark:text-stone-50">
                      {preview.title}
                    </DialogTitle>
                    <DialogDescription className="text-pretty text-[0.8125rem] leading-relaxed text-stone-600 dark:text-stone-400">
                      Nothing is saved until you confirm. Scroll the list to
                      review every chapter.
                    </DialogDescription>
                  </div>
                </div>
                {preview.description ? (
                  <p className="mt-3 line-clamp-3 border-t border-stone-300/50 pt-3 text-sm leading-relaxed text-stone-700 dark:border-stone-700/60 dark:text-stone-300">
                    {preview.description}
                  </p>
                ) : null}
              </DialogHeader>

              {error ? (
                <p
                  className="shrink-0 border-b border-red-200/80 bg-red-50/90 px-6 py-2.5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className={chapterScroll}>
                <ol className="space-y-2.5">
                  {preview.chapters.map((ch, i) => (
                    <li key={i} className={chapterCard}>
                      <span className="font-ui-primary text-xs font-semibold text-stone-500 dark:text-stone-400">
                        {i + 1}
                      </span>
                      <p className="mt-0.5 font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {ch.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                        {previewSnippet(ch.html)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-stone-300/60 bg-white/70 px-5 py-3.5 dark:border-stone-700/80 dark:bg-stone-900/90 sm:px-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-lg border border-stone-400/50 bg-white/80 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-white disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="rounded-lg bg-button px-4 py-2 text-sm font-medium text-button-foreground">
                  {isSaving ? "Saving…" : "Save to my library"}
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
