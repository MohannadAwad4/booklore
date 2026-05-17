import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GetUserSession } from "@/app/api/auth/core/session";
import Link from "next/link";
import MyBookItem from "@/components/items/MyBookItem";
import ImportBook from "@/components/book-import/ImportBook";
import CreateBook from "@/components/book-import/CreateBook";

export default async function MyBooksPage() {
  const user = await GetUserSession();

  if (!user) {
    redirect(`/?openAuth=1&redirect=${encodeURIComponent("/book/my-books")}`);
  }

  const [stories, genres] = await Promise.all([
    prisma.story.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.genre.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your library
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ImportBook />
          <CreateBook />
          <Link
            href="/book/create-book"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-button px-4 text-sm font-medium text-button-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
          >
            Create Book
          </Link>
        </div>
      </header>

      {stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No books yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a book or import one to get started.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/book/create-book"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-button px-4 text-sm font-medium text-button-foreground shadow-sm transition hover:opacity-90"
            >
              Create Book
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 sm:gap-5">
          {stories.map((story) => (
            <li key={story.id} className="min-w-0">
              <MyBookItem story={story} genres={genres} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
