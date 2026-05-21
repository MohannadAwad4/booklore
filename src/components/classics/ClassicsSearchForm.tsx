"use client";

import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

export default function ClassicsSearchForm({
  defaultQuery,
}: {
  defaultQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim().slice(0, 256);
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/classics?${qs}` : "/classics");
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full min-w-0 max-w-md flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="relative min-w-[8rem] w-full shrink-0 sm:w-56">
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or author"
          autoComplete="off"
          disabled={pending}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border py-1 pr-10 pl-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Search"
          className="text-muted-foreground hover:bg-accent hover:text-foreground absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors disabled:pointer-events-none"
        >
          {pending ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <Search className="size-4 shrink-0" strokeWidth={2} />
          )}
        </button>
      </div>
    </form>
  );
}
