"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { UpdateChapter, type UpdateChapterState } from "@/app/actions/chapter";

const EDITOR_BODY_ID = "chapter-editor-body";

function SaveIndicator() {
  const { pending } = useFormStatus();
  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {pending ? "Saving..." : ""}
    </span>
  );
}

export default function ChapterTitle({
  chapterId,
  title,
}: {
  chapterId: string;
  title: string;
}) {
  const [state, action] = useActionState<UpdateChapterState, FormData>(
    UpdateChapter,
    null
  );

  const [value, setValue] = useState(title);
  const [baseline, setBaseline] = useState(title);
  const formRef = useRef<HTMLFormElement | null>(null);


  function submitIfChanged() {
    const next = value.trim();
    if (next === baseline.trim()) return;
    formRef.current?.requestSubmit();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if ((e.nativeEvent as KeyboardEvent).repeat) return;

    e.preventDefault();
    submitIfChanged();
    e.currentTarget.blur();
    document.getElementById(EDITOR_BODY_ID)?.focus();
  }

  return (
    <form ref={formRef} action={action} className="flex flex-1 min-w-0 items-center gap-2">
      <input type="hidden" name="chapterId" value={chapterId} />
      <input
        name="title"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={submitIfChanged}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className="flex-1 min-w-0 bg-transparent text-xl font-semibold text-gray-900 dark:text-white border-none outline-none focus:ring-0 p-0 placeholder:text-gray-400"
        placeholder="Untitled chapter"
      />
      <SaveIndicator />
      {state && !state.ok && state.error ? (
        <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>
      ) : null}
    </form>
  );
}
