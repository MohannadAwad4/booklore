import { prisma } from "@/lib/prisma";
import { StoryStatus } from "@prisma/client";
import Searchbar from "@/components/Searchbar";
import BookCard from "@/components/cards/BookCard";

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
    return (
      <div className="mx-auto w-full max-w-screen-2xl space-y-4 py-4 pl-2 pr-2 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
        <Searchbar stories={[]} />
        <p className="text-muted-foreground">No published stories available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-4 py-4 pl-2 pr-2 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
      <Searchbar stories={stories} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-5 lg:grid-cols-6 xl:grid-cols-8 xl:gap-6">
        {stories.map((story) => (
          <BookCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
