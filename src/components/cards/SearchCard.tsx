
import Link from "next/link";
import { StoryType } from "@/lib/types";
import { BookCoverPlaceholder } from "@/components/media-placeholders";

export default function SearchCard({ story }: { story: StoryType }) {
  const coverSrc = story.coverUrl?.trim() || null;
  return (
    <Link href={`/book/${story.id}/chapters`} className="flex gap-3">
      <div className="relative aspect-[2/3] w-[72px] shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={story.title}
            className="object-contain object-center"
            sizes="144px"
          />
        ) : (
          <BookCoverPlaceholder className="size-10 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {story.title}
        </h3>
        <p>{story.description}</p>
      </div>
    </Link>
  );
}
