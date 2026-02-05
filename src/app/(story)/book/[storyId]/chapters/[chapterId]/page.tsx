import { redirect } from "next/navigation";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import Editor from "@/components/rich-text-editor";
import  Form from "next/form";
import { UpdateChapter } from "@/app/actions/chapter";
import ChapterTitle from "@/components/ChapterTitle";
export default async function ChapterEditPage({
  params,
}: {
  params: Promise<{ storyId: string; chapterId: string }>;
}) {
  const { storyId, chapterId } = await params;
  if (!storyId || !chapterId) {
    return <div>Invalid story or chapter ID</div>;
  }

  const user = await GetUserSession();
  if (!user) redirect("/login");

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, storyId, authorId: user.id },
    select: { id: true, title: true, content: true },
  });
  if (!chapter) {
    return <div>Chapter not found or you do not have permission to edit it.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full">
      <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-3 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <ChapterTitle chapterId={chapter.id} title={chapter.title} />
        
       
        <Link
          href={`/book/${storyId}/chapters`}
          className="shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          ← Back to chapters
        </Link>
      </header>
      <div className="flex-1 min-h-0 w-full">
        <Editor chapterId={chapter.id} initialContent={chapter.content} />
      </div>
    </div>
  );
}
