import { GetUserSession } from "@/app/api/auth/core/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateChapter from "@/app/actions/chapter/create-chapter";
import Link from "next/link";

export default async function Chapters({
  params,
}: {
  params: { storyId: string };
}) {
  const user = await GetUserSession();
  const { storyId } = await params;

  if (!user) {
    redirect("/auth/login");
  }

  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
  });
  const userIsAuthor = story?.authorId === user.id;

  const chapters = await prisma.chapter.findMany({
    where: {
      storyId,
      status: userIsAuthor ? undefined : "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!chapters || chapters.length === 0) {
    return (
      <div className="p-4">
        <form action={CreateChapter}>
          <input type="hidden" name="storyId" value={storyId} />
          <button type="submit">Create Chapter</button>
        </form>
        <h1 className="text-2xl font-bold">No chapters available</h1>
      </div>
    );
  }

  return (
    <div>
      <form action={CreateChapter}>
        <input type="hidden" name="storyId" value={storyId} />
        <button type="submit">Create Chapter</button>
      </form>
      <div>
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/book/${storyId}/chapters/${chapter.id}`}
          >
            {chapter.title}
            {chapter.status}
          </Link>
        ))}
      </div>
    </div>
  );
}
