("use server");
import RequireUser from "@/app/api/auth/core/require-user";
import { prisma } from "@/lib/prisma";
import { chapterStatus } from "@prisma/client";

export default async function SetChapterStatus(fordata: FormData) {
  const user = await RequireUser();
  const chapterId = fordata.get("chapterId") as string;
  const status = fordata.get("status") as chapterStatus;
  if (!chapterId || !status) {
    throw new Error("Missing fields");
  }
  const chapter = await prisma.chapter.updateMany({
    where: {
      id: chapterId,
      authorId: user.id,
    },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
  return chapter;
}
