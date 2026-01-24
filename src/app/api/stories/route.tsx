import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request) {
    try {
        const stories = await prisma.story.findMany({
            orderBy: { createdAt: "desc" },
        });
        
        return NextResponse.json({ stories });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}