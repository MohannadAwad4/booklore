import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userid: string }>;
}) {
  const { userid } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userid },
    select: {
      id: true,
      username: true,
      displayName: true,
      followersCount: true,
      followingCount: true,
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          {user.displayName?.trim() || user.username}
        </h1>
        <p className="text-muted-foreground">@{user.username}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{user.followersCount}</span>{" "}
        followers ·{" "}
        <span className="font-medium text-foreground">{user.followingCount}</span>{" "}
        following
      </p>
    </div>
  );
}