"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menu_bar";
import { SaveChapterContent } from "@/app/actions/chapter";

const defaultContent = "<p>Start writing your story...</p>";

type EditorProps = {
  chapterId?: string;
  initialContent?: string | null;
};

const Editor = ({ chapterId, initialContent }: EditorProps) => {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const initial = initialContent?.trim() || defaultContent;
  const [lastSavedContent, setLastSavedContent] = useState(initial);
  const lastSavedRef = useRef(initial);
  const isDirtyRef = useRef(false);
  const router = useRouter();

  lastSavedRef.current = lastSavedContent;

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: "chapter-editor-body",
        class: "focus:outline-none min-h-full",
      },
    },
  });

  // Track when content differs from last save (for leave-without-saving prompts)
  useEffect(() => {
    if (!editor || !chapterId) return;
    const onUpdate = () => {
      isDirtyRef.current = editor.getHTML() !== lastSavedRef.current;
    };
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, chapterId]);

  // Warn on refresh/close or in-app link click when there are unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) e.preventDefault();
    };
    const onLinkClick = (e: MouseEvent) => {
      if (!isDirtyRef.current) return;
      const a = (e.target as Element).closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        if (new URL(href, window.location.origin).origin !== window.location.origin) return;
      } catch {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm("You have unsaved changes. Leave anyway?")) {
        router.push(href);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onLinkClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onLinkClick, true);
    };
  }, [router]);

  async function handleSave() {
    if (!editor || !chapterId) return;
    setSaveError(null);
    setSaving(true);
    try {
      await SaveChapterContent(chapterId, editor.getHTML());
      const html = editor.getHTML();
      setLastSavedContent(html);
      lastSavedRef.current = html;
      isDirtyRef.current = false;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 px-4 py-2">
        <MenuBar editor={editor} />
        {chapterId && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
      </div>
      {saveError && (
        <p className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30">
          {saveError}
        </p>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto flex justify-center py-8 px-4">
        <div className="w-full max-w-[816px] min-h-[calc(100vh-12rem)] bg-white dark:bg-neutral-900 shadow-lg rounded-sm py-12 px-16">
          <EditorContent
            editor={editor}
            className="prose prose-lg max-w-none dark:prose-invert focus:outline-none min-h-full [&_.ProseMirror]:min-h-[calc(100vh-16rem)]"
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
