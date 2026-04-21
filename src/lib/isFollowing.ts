import { prisma } from "./prisma";

/**
 * @param followerId - User who might be following (the follower)
 * @param followingId - User who might be followed (the followee)
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
  return row != null;
}
