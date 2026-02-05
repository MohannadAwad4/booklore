"use client";

export default function MenuBar({ editor }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Text Formatting */}
      <div className="flex gap-1 border-r border-gray-300 dark:border-neutral-700 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("bold")
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("italic")
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("strike")
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          Strike
        </button>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r border-gray-300 dark:border-neutral-700 pr-2">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          H3
        </button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-300 dark:border-neutral-700 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("bulletList")
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive("orderedList")
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          1. List
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-3 py-1.5 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ↶ Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-3 py-1.5 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ↷ Redo
        </button>
      </div>
    </div>
  );
}
