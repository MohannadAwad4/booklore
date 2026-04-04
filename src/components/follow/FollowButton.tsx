"use client";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { followUser, unfollowUser } from "@/app/actions/follow";
export default function FollowButton({
  targetUserId,
  isFollowingInitial,
}: {
  targetUserId: string;
  isFollowingInitial: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState<boolean>(isFollowingInitial);
  const handleFollowClick = () => {
    if (isFollowing) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId);
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <>
      <button onClick={handleFollowClick}>
        {isFollowing ? "Following" : "Follow"}
      </button>
    </>
  );
}
