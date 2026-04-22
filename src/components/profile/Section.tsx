import { Users } from "lucide-react";

function formatCount(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function Section({
  followers,
  following,
}: {
  followers: number;
  following: number;
}) {
  return (
    <section aria-label="Profile stats">
      <div className="flex w-full overflow-hidden rounded-3xl bg-sidebar py-4 shadow-sm ring-1 ring-black/20 dark:ring-white/10">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-3 sm:px-4">
          <p className="font-serif text-3xl font-semibold tracking-tight  tabular-nums sm:text-4xl">
            {formatCount(followers)}
          </p>
          <div className="flex items-center gap-1.5 text-[#9a8a7a]">
            <Users className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-medium tracking-wide">Followers</span>
          </div>
        </div>

        <div
          className="my-1 w-px shrink-0 self-stretch bg-white/[0.12]"
          aria-hidden
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3 sm:px-4">
          <p className="font-serif text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
            {formatCount(following)}
          </p>
          <div className="flex items-center gap-1.5 text-[#9a8a7a]">
            <Users className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-xs font-medium tracking-wide">Following</span>
          </div>
        </div>
      </div>
    </section>
  );
}
