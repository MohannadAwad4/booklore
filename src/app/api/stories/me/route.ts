import { NextResponse } from "next/server";
import { GetUserSession } from "../../auth/core/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await GetUserSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stories = await prisma.story.findMany({
            where: { authorId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ stories });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}