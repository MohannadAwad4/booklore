"use server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AddBookComment(formData: FormData) {
    const user = await GetUserSession();
    if (!user) {
        throw new Error("Unauthorized");
    }
    const storyId = formData.get("storyId") as string;
    const content = formData.get("content") as string;
    if (!storyId || !content) {
        throw new Error("Missing storyId or content");
    }
    await prisma.comment.create({
        data: { userId: user.id, storyId, content },
    });
    revalidatePath(`/book/${storyId}/chapters`);
}