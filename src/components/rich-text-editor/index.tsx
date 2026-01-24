"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menu_bar";

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your story...</p>",
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none dark:prose-invert p-6 md:p-8 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default Editor;
