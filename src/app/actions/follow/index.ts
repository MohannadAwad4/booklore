"use server";

import { revalidatePath } from "next/cache";
import { GetUserSession } from "@/app/api/auth/core/session";
import { prisma } from "@/lib/prisma";

async function revalidateProfilesForPair(followerId: string, followingId: string) {
  const [targetUser, meUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: followingId },
      select: { username: true },
    }),
    prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true },
    }),
  ]);
  if (targetUser?.username) {
    revalidatePath(`/book/u/${targetUser.username}`);
  }
  if (meUser?.username) {
    revalidatePath(`/book/u/${meUser.username}`);
  }
}

export async function followUser(followingId: string) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (user.id === followingId) {
    throw new Error("You cannot follow yourself");
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    });
    if (existing) {
      return;
    }

    const target = await tx.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });
    if (!target) {
      throw new Error("User not found");
    }

    await tx.follow.create({
      data: { followerId: user.id, followingId },
    });
    await tx.user.update({
      where: { id: user.id },
      data: { followingCount: { increment: 1 } },
    });
    await tx.user.update({
      where: { id: followingId },
      data: { followersCount: { increment: 1 } },
    });
  });

  await revalidateProfilesForPair(user.id, followingId);
}

export async function unfollowUser(followingId: string) {
  const user = await GetUserSession();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.follow.deleteMany({
      where: { followerId: user.id, followingId },
    });
    if (deleted.count === 0) {
      return;
    }
    await tx.user.update({
      where: { id: user.id },
      data: { followingCount: { decrement: 1 } },
    });
    await tx.user.update({
      where: { id: followingId },
      data: { followersCount: { decrement: 1 } },
    });
  });

  await revalidateProfilesForPair(user.id, followingId);
}
