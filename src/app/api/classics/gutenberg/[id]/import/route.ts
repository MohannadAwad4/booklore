import { NextResponse } from "next/server";
import { ensureGutenbergStoryImported } from "@/lib/classics/import-gutenberg-story";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id: raw } = await params;
  const gutenbergId = parseInt(raw, 10);
  if (!Number.isFinite(gutenbergId) || gutenbergId < 1) {
    return NextResponse.json({ error: "Invalid book id." }, { status: 400 });
  }

  try {
    const storyId = await ensureGutenbergStoryImported(gutenbergId);
    return NextResponse.json({ storyId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
