"use server";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";

export default async function CreateBook(formData: FormData) {
  const user = await GetUserSession();
  if (!user)
    throw new Error("UnAuthorised, Please log in before creating book");
  await prisma.story.create({
    data: {
      authorId: user.id,
      storyType: "BOOK",
      title: formData.get("title") as string,
      description: formData.get("description") as string,
    },
  });
}
