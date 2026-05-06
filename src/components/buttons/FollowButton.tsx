"use client";
import { useState } from "react";
import { followUser, unfollowUser } from "@/app/actions/follow";
import { cn } from "@/lib/utils";
import { useUser } from "../providers/SessionUserProvider";
import { toastNotLoggedIn } from "../modals/ToastIndex";

export default function FollowButton({
  targetUserId,
  isFollowingInitial,
  className,
}: {
  targetUserId: string;
  isFollowingInitial: boolean;
  className?: string;
}) {
  const [isFollowing, setIsFollowing] = useState<boolean>(isFollowingInitial);
  const user = useUser();
  const handleFollowClick = () => {
    if(!user){
      toastNotLoggedIn();
      return;
    }
    if (isFollowing) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId);
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <button
      type="button"
      onClick={handleFollowClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:bg-muted hover:opacity-95",
        className,
      )}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
