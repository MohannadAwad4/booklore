// POST /api/stories/[storyId]/chapters/bulk
// Body: { chapters: [{ title: "Ch 1", content: "..." }, { title: "Ch 2", content: "..." }] }

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GetUserSession } from "@/app/api/auth/core/session";

type Params = { params: Promise<{ storyId: string }> };

export async function POST(req: Request, { params }: Params) {
    try {
        const user = await GetUserSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { storyId } = await params;
        const { chapters } = await req.json();
        
        // Verify user owns this story
        const story = await prisma.story.findUnique({
            where: { id: storyId, authorId: user.id }
        });
        
        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }
        
        // Get current highest chapter number
        const lastChapter = await prisma.chapter.findFirst({
            where: { storyId },
            orderBy: { chapterNumber: "desc" }
        });
        const startNumber = (lastChapter?.chapterNumber ?? 0) + 1;
        
        // Create all chapters in a transaction
        const createdChapters = await prisma.$transaction(
            chapters.map((chapter: { title: string; content: string }, index: number) =>
                prisma.chapter.create({
                    data: {
                        storyId,
                        authorId: user.id,
                        chapterNumber: startNumber + index,
                        title: chapter.title,
                        content: chapter.content,
                    }
                })
            )
        );
        
        return NextResponse.json({ chapters: createdChapters }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create chapters" }, { status: 500 });
    }
}