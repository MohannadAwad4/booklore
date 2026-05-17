"use client";

import type { SessionUser } from "@/app/api/auth/core/session";
import Logout from "@/app/actions/auth/logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  BookOpenIcon,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const menuLinkClass =
  "flex w-full cursor-pointer items-center gap-2 text-sm [&_svg]:pointer-events-none";

export default function ProfileDropdownMenu({ user }: { user: SessionUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open account menu"
        >
          <Avatar className="size-9 ring-2 ring-border sm:size-10">
            <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-muted font-ui-primary text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-52 w-(--radix-dropdown-menu-trigger-width) font-ui-primary sm:min-w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">
            {user.username}
          </p>
          <p className="truncate text-xs">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/user/${user.id}`} className={menuLinkClass}>
              <UserIcon />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/book/my-books`} className={menuLinkClass}>
              <BookOpenIcon />
              Library
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings?tab=support" className={menuLinkClass}>
              <HelpCircleIcon />
              Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className={menuLinkClass}>
              <SettingsIcon />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-default gap-2"
            onPointerDown={(e) => e.preventDefault()}
            onSelect={(e) => e.preventDefault()}
          >
            <span className="flex-1 font-sans text-sm">Mode</span>
            <ThemeToggle />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            void Logout();
          }}
        >
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
