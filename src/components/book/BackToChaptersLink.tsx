"use client";

import { useRouter } from "next/navigation";

export default function BackToChaptersLink({ storyId }: { storyId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        router.push(`/book/${storyId}/chapters`);
        router.refresh();
      }}
      className="shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
    >
      ← Back to chapters
    </button>
  );
}
