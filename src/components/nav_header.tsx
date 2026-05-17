import { PenLine, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { GetUserSession } from "@/app/api/auth/core/session";
import { AuthNavTrigger } from "./providers/AuthModalProvider";
import { BrandWordmark, brandHomeAriaLabel } from "./brand-wordmark";
import ProfileDropdownMenuDynamic from "./ProfileDropdownMenuDynamic";

export default async function NavigationHeader() {
  const user = await GetUserSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between px-5 sm:h-16 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group shrink-0 transition-opacity hover:opacity-80"
          aria-label={brandHomeAriaLabel}
        >
          <BrandWordmark />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/book/create-book"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-button px-3.5 text-sm font-medium text-button-foreground shadow-sm transition-[opacity,transform] hover:opacity-92 active:scale-[0.98] sm:h-10 sm:px-5"
          >
            <PenLine
              className="size-4 shrink-0 opacity-90"
              strokeWidth={2}
              aria-hidden
            />
            Write
          </Link>

          <nav className="flex items-center">
            {user ? (
              <div className="flex items-center">
                <ProfileDropdownMenuDynamic user={user} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/settings">
                  <SettingsIcon
                    className="size-5 shrink-0  "
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </Link>
                <AuthNavTrigger />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
