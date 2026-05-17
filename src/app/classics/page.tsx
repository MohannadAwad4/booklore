import ClassicBookItem, {
  type GutendexClassicBook,
} from "@/components/classics/ClassicBookItem";
import ClassicsPagination from "@/components/classics/ClassicsPagination";
import Link from "next/link";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";

const GUTENDEX_PAGE_SIZE = 32;

type GutendexResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexClassicBook[];
};

export default async function ClassicsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const parsed = parseInt(String(params.page ?? "1"), 10);
  const currentPage = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 256) : "";

  const gutendexQuery = new URLSearchParams({
    copyright: "false",
    page: String(currentPage),
  });
  if (query) {
    gutendexQuery.set("search", query);
  }

  let data: GutendexResponse | null = null;
  let loadError: string | null = null;

  try {
    const res = await fetch(
      `https://gutendex.com/books/?${gutendexQuery.toString()}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      loadError = "Could not load books from Gutendex.";
    } else {
      data = (await res.json()) as GutendexResponse;
    }
  } catch {
    loadError = "Could not load books from Gutendex.";
  }

  const books = data?.results ?? [];
  const totalPages = data
    ? Math.max(1, Math.ceil(data.count / GUTENDEX_PAGE_SIZE))
    : 1;

  if (data && currentPage > totalPages) {
    const sp = new URLSearchParams({ page: String(totalPages) });
    if (query) sp.set("q", query);
    redirect(`/classics?${sp.toString()}`);
  }

  return (
    <div className="font-sans mx-auto w-full max-w-screen-2xl space-y-8 py-4 pl-2 pr-2 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 gap-y-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3 gap-y-2">
          <form
            action="/classics"
            method="get"
            className="flex w-full min-w-0 max-w-md flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="relative min-w-[8rem] w-full shrink-0 sm:w-56">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search"
                autoComplete="off"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border py-1 pr-10 pl-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="text-muted-foreground hover:bg-accent hover:text-foreground absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
              >
                <Search className="size-4 shrink-0" strokeWidth={2} />
              </button>
            </div>
          </form>
          {query ? (
            <Link
              href="/classics"
              className="text-muted-foreground hover:text-foreground shrink-0 text-sm underline-offset-4 hover:underline sm:shrink-0"
            >
              Clear search
            </Link>
          ) : null}
        </div>
        <div className="ml-auto shrink-0 [&>nav]:mx-0 [&>nav]:w-auto [&>nav]:justify-end">
          <ClassicsPagination
            path="/classics"
            currentPage={currentPage}
            totalPages={totalPages}
            q={query}
          />
        </div>
      </div>

      {loadError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-5 lg:grid-cols-6 xl:grid-cols-8 xl:gap-6">
        {books.map((book) => (
          <ClassicBookItem key={book.id} book={book} />
        ))}
      </div>

      {books.length === 0 && !loadError ? (
        <p className="text-center text-sm text-muted-foreground">
          {query ? "No books matched your search." : "No books on this page."}
        </p>
      ) : null}
    </div>
  );
}
