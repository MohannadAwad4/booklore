import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensureGutenbergStoryImported } from "@/lib/classics/import-gutenberg-story";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ClassicImportRunner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = parseInt(raw, 10);
  if (!Number.isFinite(id) || id < 1) notFound();

  const exists = await prisma.story.findFirst({
    where: { gutenbergId: id },
    select: { id: true },
  });
  if (exists) {
    redirect(`/book/${exists.id}/chapters`);
  }

  let storyId: string;
  try {
    storyId = await ensureGutenbergStoryImported(id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed.";
    return (
      <div className="font-sans mx-auto max-w-lg space-y-6 px-4 py-12">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
          <Link href="/classics">
            <ArrowLeft className="size-4" />
            Back to classics
          </Link>
        </Button>
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </div>
      </div>
    );
  }

  redirect(`/book/${storyId}/chapters`);
}
