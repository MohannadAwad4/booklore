import { NextResponse } from "next/server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { parseBookFromBuffer } from "@/lib/book-import/parse-book";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await GetUserSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "Missing or empty file" },
      { status: 400 },
    );
  }

  const titleOverride =
    (formData.get("title") as string | null)?.trim() || undefined;

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name || "book.txt";

  try {
    const parsed = await parseBookFromBuffer(buffer, filename, {
      title: titleOverride,
    });
    if (parsed.chapters.length === 0) {
      return NextResponse.json({ error: "No chapters found" }, { status: 400 });
    }
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to parse file" },
      { status: 400 },
    );
  }
}
