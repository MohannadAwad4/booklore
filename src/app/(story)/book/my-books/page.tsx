import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GetUserSession } from "@/app/api/auth/core/session";
import Link from "next/link";
import MyBookItem from "@/components/MyBookItem";
import ImportBook from "@/components/book-import/ImportBook";
import CreateBook from "@/components/book-import/CreateBook";

export default async function MyBooksPage() {
  const user = await GetUserSession();

  if (!user) {
    redirect("/login");
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
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Import a book</h2>
        <p className="text-sm text-muted-foreground">
          Choose a file to parse. You’ll see a preview before anything is saved.
        </p>
        <ImportBook />
      </section>
      <CreateBook  />
      {/* <Link href="/book/create-book">Create Book</Link> */}
      {(!stories || stories.length === 0) && <div>No books found</div>}
      {stories.map((story) => (
        <div key={story.id}>
          <MyBookItem story={story} genres={genres} />
        </div>
      ))}
    </div>
  );
}
