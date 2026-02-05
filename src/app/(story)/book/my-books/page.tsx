import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GetUserSession } from "@/app/api/auth/core/session";
import Link from "next/link";
import MyBookItem from "@/components/MyBookItem";

export default async function MyBooksPage() {
  const user = await GetUserSession();

  if (!user) {
    redirect("/login");
  }

  const stories = await prisma.story.findMany({
    where: {
      authorId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  //here will be a publish button

  return (
    <div>
      <Link href="/book/create-book">Create Book</Link>
      {stories.map((story) => (
        <div key={story.id}>
          <MyBookItem story={story} />
        </div>
      ))}
    </div>
  );
}
