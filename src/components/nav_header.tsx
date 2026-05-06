import { PenLine } from "lucide-react";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import ProfileDropdownMenu from "./profile-dropdown-menu";
import ThemeToggle from "./ThemeToggle";
import { SettingsIcon } from "lucide-react";

export default async function NavigationHeader() {
  const user = await GetUserSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 sm:text-2xl"
        >
          Lore
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/book/create-book"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-button px-3.5 text-sm font-medium text-button-foreground shadow-sm transition-[opacity,transform] hover:opacity-92 active:scale-[0.98] sm:h-10 sm:px-5"
          >
            <PenLine className="size-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
            Write
          </Link>

       

          <nav className="flex items-center">
            {user ? (
              <ProfileDropdownMenu user={user} />
            ) : (
              <div className="flex items-center">
                <Link href="/settings">
                  <SettingsIcon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                </Link>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Log in
              </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
