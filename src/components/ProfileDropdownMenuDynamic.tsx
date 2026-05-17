"use client";

import dynamic from "next/dynamic";
import type { SessionUser } from "@/app/api/auth/core/session";

const ProfileDropdownMenu = dynamic(
  () => import("./profile-dropdown-menu"),
  {
    ssr: false,
    loading: () => (
      <div
        className="size-9 shrink-0 animate-pulse rounded-full bg-muted ring-2 ring-border motion-reduce:animate-none sm:size-10"
        aria-busy="true"
        aria-label="Loading account menu"
        role="status"
      />
    ),
  }
);

export default function ProfileDropdownMenuDynamic({
  user,
}: {
  user: SessionUser;
}) {
  return <ProfileDropdownMenu user={user} />;
}
