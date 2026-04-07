import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GetUserSession } from "@/app/api/auth/core/session";
import Link from "next/link";
import { StoryStatus } from "@prisma/client";
import Searchbar from "@/components/Searchbar";

export default async function BookFeedPage() {
  const stories = await prisma.story.findMany({
    where: {
      status: { not: StoryStatus.DRAFT },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!stories || stories.length === 0) {
    return <div>No published stories available.</div>;
  }
    return (
      <div>
        <Searchbar />
      {stories.map((story) => (
        <Link className="p-2" key={story.id} href={`/book/${story.id}/chapters`}>
          {story.title}
        </Link>
      ))}
    </div>
  );
}
