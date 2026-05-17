import { prisma } from "@/lib/prisma";
import {
  StoryCategory,
  StoryProgress,
  StorySource,
  StoryStatus,
  type Prisma,
} from "@prisma/client";
import { GetUserSession } from "@/app/api/auth/core/session";
import Searchbar from "@/components/Searchbar";
import BookCard from "@/components/cards/BookCard";
import FilterSection from "@/components/home/FilterSection";

type BookFeedPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    progress?: string;
    genres?: string;
  }>;
};

export default async function BookFeedPage({
  searchParams,
}: BookFeedPageProps) {
  const { q, category, progress, genres } = await searchParams;

  const where: Prisma.StoryWhereInput = {
    status: { not: StoryStatus.DRAFT },
    //storySource: StorySource.USER,
  };

  const search = q?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (
    category?.toLocaleUpperCase() === StoryCategory.FICTION ||
    category?.toLocaleUpperCase() === StoryCategory.NON_FICTION
  ) {
    where.storyCategory = category.toLocaleUpperCase() as StoryCategory;
  }

  if (
    progress?.toLocaleUpperCase() === StoryProgress.ONGOING ||
    progress?.toLocaleUpperCase() === StoryProgress.HIATUS ||
    progress?.toLocaleUpperCase() === StoryProgress.COMPLETE
  ) {
    where.progressStatus = progress?.toLocaleUpperCase() as StoryProgress;
  }

  const genreSlugs =
    genres
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  if (genreSlugs.length > 0) {
    where.genres = {
      some: { genre: { slug: { in: genreSlugs } } },
    };
  }

  const [stories, genresList, sessionUser] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.genre.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    GetUserSession(),
  ]);

  const storyIds = stories.map((s) => s.id);
  let bookmarkedStoryIds: string[] = [];
  let likedStoryIds: string[] = [];
  if (sessionUser && storyIds.length > 0) {
    const [bookmarkRows, likeRows] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: sessionUser.id, storyId: { in: storyIds } },
        select: { storyId: true },
      }),
      prisma.storyLike.findMany({
        where: { userId: sessionUser.id, storyId: { in: storyIds } },
        select: { storyId: true },
      }),
    ]);
    bookmarkedStoryIds = bookmarkRows.map((r) => r.storyId);
    likedStoryIds = likeRows.map((r) => r.storyId);
  }

  if (!stories.length) {
    return (
      <div className="font-sans mx-auto w-full max-w-screen-2xl space-y-4 py-4 pl-2 pr-2 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
        <FilterSection genres={genresList} />
        {/* <Searchbar stories={[]} /> */}
        <p className="text-muted-foreground">No published stories available.</p>
      </div>
    );
  }

  return (
    <div className="font-sans mx-auto w-full max-w-screen-2xl space-y-4 py-4 pl-2 pr-2 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
      <FilterSection genres={genresList} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-5 lg:grid-cols-6 xl:grid-cols-8 xl:gap-6 mt-8">
        {stories.map((story) => (
          <BookCard
            key={story.id}
            story={story}
            initialBookmarked={
              !!sessionUser && bookmarkedStoryIds.includes(story.id)
            }
            initialLiked={!!sessionUser && likedStoryIds.includes(story.id)}
          />
        ))}
      </div>
    </div>
  );
}
