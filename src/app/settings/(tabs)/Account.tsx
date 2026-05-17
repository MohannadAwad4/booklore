"use client";

import { BRAND_NAME } from "@/components/brand-wordmark";
import DeleteAccountButton from "@/components/buttons/DeleteAccount";
import { useUser } from "@/components/providers/SessionUserProvider";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Account() {
  const user = useUser();

  if (!user) {
    return (
      <p className="rounded-lg border border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        Sign in to view account settings.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your public name and sign-in email for {BRAND_NAME}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Username
            </dt>
            <dd className="mt-1.5 text-sm text-foreground">{user.username}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </dt>
            <dd className="mt-1.5 break-all text-sm text-foreground">
              {user.email}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Appearance</p>
            <p className="text-xs text-muted-foreground">Light or dark theme</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-4">
          <h3 className="text-sm font-medium text-destructive">Danger zone</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently delete your account and associated data. This cannot be
            undone.
          </p>
          <div className="mt-4">
            <DeleteAccountButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
