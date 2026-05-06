"use client";

import { LifeBuoy, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Account from "./Account";
import Support from "./Support";

const tabs = [
  { id: "account" as const, label: "Account", Icon: User },
  { id: "support" as const, label: "Support", Icon: LifeBuoy },
];

type TabId = (typeof tabs)[number]["id"];

export default function SettingTabController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("tab");
  const active: TabId = raw === "support" ? "support" : "account";

  function setTab(id: TabId) {
    const sp = new URLSearchParams(searchParams.toString());
    if (id === "account") {
      sp.delete("tab");
    } else {
      sp.set("tab", id);
    }
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="w-full space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account details, appearance, and support.
        </p>
      </header>

      <nav
        className="-mx-px flex gap-0 border-b border-border px-px"
        role="tablist"
        aria-label="Settings sections"
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              id={`settings-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "-mb-px flex min-h-11 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          );
        })}
      </nav>

      <div
        id={`settings-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`settings-tab-${active}`}
        className="pt-1"
      >
        {active === "account" ? <Account /> : <Support />}
      </div>
    </div>
  );
}
