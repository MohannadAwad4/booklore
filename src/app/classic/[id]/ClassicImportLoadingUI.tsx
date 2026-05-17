import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassicImportLoadingUI() {
  return (
    <div className="font-sans mx-auto flex max-w-lg flex-col gap-8 px-4 py-16">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5" asChild>
        <Link href="/classics">
          Back to classics
        </Link>
      </Button>

      <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
        <div className="flex items-center gap-3">
          <Loader2
            className="size-8 shrink-0 animate-spin text-primary"
            aria-hidden
          />
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Importing classic…
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Downloading the book from Project Gutenberg and saving it as Parts in
          your library. Large works can take half a minute or more the first
          time.
        </p>
        <div
          className="h-1.5 w-full max-w-md animate-pulse rounded-full bg-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}
