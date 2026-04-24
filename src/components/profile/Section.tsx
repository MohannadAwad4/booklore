import { Book, Users } from "lucide-react";

function formatCount(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function Section({
  followers,
  following,
  books,
}: {
  followers: number;
  following: number;
  books: number;
}) {
  return (
    <section aria-label="Profile stats">
      <div className="flex w-full overflow-hidden rounded-3xl bg-card py-4 shadow-sm ring-1 ring-border">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 sm:px-4">
          <p className="font-serif text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
            {formatCount(followers)}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-medium tracking-wide">Followers</span>
          </div>
        </div>

        <div
          className="my-1 w-px shrink-0 self-stretch bg-border"
          aria-hidden
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 sm:px-4">
          <p className="font-serif text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
            {formatCount(following)}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-medium tracking-wide">Following</span>
          </div>
        </div>

        <div
          className="my-1 w-px shrink-0 self-stretch bg-border"
          aria-hidden
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 sm:px-4">
          <p className="font-serif text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
            {formatCount(books)}
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Book className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-medium tracking-wide">Books</span>
          </div>
        </div>
      </div>
    </section>
  );
}
