import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ storyId: string }> };

export async function GET(_req: Request, { params }: Params) {
    try {
        const { storyId } = await params;
        
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            include: {
                chapters: {
                    orderBy: { chapterNumber: "asc" }
                }
            }
        });
        
        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }
        
        return NextResponse.json({ story });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
    }
}