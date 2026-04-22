import { BookOpen, UserRound } from "lucide-react";

type PlaceholderProps = {
  className?: string;
};

/** Default “no cover” / failed cover — use inside a sized container. */
export function BookCoverPlaceholder({ className }: PlaceholderProps) {
  return (
    <BookOpen
      className={className ?? "size-[min(40%,4rem)] text-muted-foreground"}
      strokeWidth={1.25}
      aria-hidden
    />
  );
}

/** Default “no avatar” / failed avatar — use inside a square circle crop. */
export function AvatarPlaceholder({ className }: PlaceholderProps) {
  return (
    <UserRound
      className={className ?? "size-[55%] text-muted-foreground"}
      strokeWidth={1.25}
      aria-hidden
    />
  );
}
