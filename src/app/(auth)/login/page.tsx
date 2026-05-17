"use client";

import { openAuthModal } from "@/lib/auth-modal-bridge";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginHandoff() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    openAuthModal({ tab: "login" });
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [router, searchParams]);

  return (
    <p className="p-6 text-center text-sm text-muted-foreground">
      Opening sign in…
    </p>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
      }
    >
      <LoginHandoff />
    </Suspense>
  );
}
