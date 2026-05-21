export default function ClassicsLoading() {
  return (
    <div className="font-sans mx-auto w-full max-w-screen-2xl space-y-8 py-4 pl-2 pr-2 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 gap-y-4">
        <div className="h-9 w-full max-w-md animate-pulse rounded-md bg-muted sm:w-56" />
        <div className="ml-auto flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="size-9 animate-pulse rounded-md bg-muted"
              aria-hidden
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-5 lg:grid-cols-6 xl:grid-cols-8 xl:gap-6">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-2">
            <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
