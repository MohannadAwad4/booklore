import { NextResponse } from "next/server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import type { ParsedBook } from "@/lib/book-import/parse-book";

export const runtime = "nodejs";

function isParsedBook(body: unknown): body is ParsedBook {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) return false;
  if (o.description != null && typeof o.description !== "string") return false;
  if (!Array.isArray(o.chapters) || o.chapters.length === 0) return false;
  return o.chapters.every(
    (c) =>
      c &&
      typeof c === "object" &&
      typeof (c as { title?: string }).title === "string" &&
      typeof (c as { html?: string }).html === "string",
  );
}

export async function POST(request: Request) {
  const user = await GetUserSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isParsedBook(body)) {
    return NextResponse.json(
      { error: "Invalid book payload: need title and chapters with title and html" },
      { status: 400 },
    );
  }

  const parsed = body;
  const description =
    parsed.description === null || parsed.description === undefined
      ? null
      : String(parsed.description).trim() || null;

  const story = await prisma.$transaction(async (tx) =>
    tx.story.create({
      data: {
        authorId: user.id,
        storyType: "BOOK",
        title: parsed.title.trim(),
        description,
        chaptersCount: parsed.chapters.length,
        chapters: {
          create: parsed.chapters.map((c, i) => ({
            authorId: user.id,
            chapterNumber: i + 1,
            title: c.title.trim() || `Chapter ${i + 1}`,
            content: c.html,
            status: "DRAFT" as const,
          })),
        },
      },
      select: { id: true, title: true },
    }),
  );

  return NextResponse.json({
    storyId: story.id,
    title: story.title,
    chapterCount: parsed.chapters.length,
  });
}
