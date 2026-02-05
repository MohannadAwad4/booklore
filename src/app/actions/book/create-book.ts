"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

function getExtension(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export default async function CreateBook(formData: FormData) {
  const user = await GetUserSession();
  if (!user) throw new Error("Unauthorised. Please log in before creating a book.");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? null;
  if (!title) throw new Error("Title is required.");

  const story = await prisma.story.create({
    data: {
      authorId: user.id,
      storyType: "BOOK",
      title,
      description,
    },
  });

  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    if (!ACCEPTED_TYPES.includes(coverFile.type)) {
      throw new Error("Cover must be PNG, JPG, or WebP.");
    }
    if (coverFile.size > MAX_SIZE) {
      throw new Error("Cover image must be under 4MB.");
    }
    const ext = getExtension(coverFile.type);
    const dir = path.join(process.cwd(), "public", "uploads", "covers");
    await mkdir(dir, { recursive: true });
    const filename = `${story.id}.${ext}`;
    const filepath = path.join(dir, filename);
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    await writeFile(filepath, buffer);
    const coverUrl = `/uploads/covers/${filename}`;
    await prisma.story.update({
      where: { id: story.id },
      data: { coverUrl },
    });
  }

  redirect(`/book/${story.id}/chapters`);
}
