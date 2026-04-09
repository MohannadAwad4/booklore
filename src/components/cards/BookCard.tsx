import type { Story } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

function formatReads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export default function BookCard({ story }: { story: Story }) {
  const coverSrc = story.coverUrl?.trim() || "/images/default-cover.png";

  return (
    <Link
      href={`/book/${story.id}/chapters`}
      className="group block h-full rounded-lg p-0.5 outline-none transition hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-neutral-200 to-neutral-300 shadow-sm ring-1 ring-black/10 dark:from-neutral-800 dark:to-neutral-900 dark:ring-white/10">
        <Image
          src={coverSrc}
          alt={`${story.title} cover`}
          fill
          className="object-cover object-center transition duration-300 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
        />
      </div>

      <div className="px-0 pt-1.5">
        <h3 className="line-clamp-2 text-[11px] font-bold leading-tight tracking-tight text-foreground group-hover:underline sm:text-xs">
          {story.title}
        </h3>
        {story.viewsCount > 0 ? (
          <p className="mt-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400 sm:text-xs">
            {formatReads(story.viewsCount)} reads
          </p>
        ) : null}
      </div>
    </Link>
  );
}
