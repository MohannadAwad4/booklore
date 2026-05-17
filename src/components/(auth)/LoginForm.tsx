"use client";

import { GoogleGlyph } from "@/components/icons/GoogleGlyph";
import { loginCredentialsSchema } from "@/lib/validations/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";

function oauthErrorMessage(code: string): string {
  const map: Record<string, string> = {
    access_denied: "Google sign-in was cancelled.",
    invalid_oauth_state: "Sign-in expired or was invalid. Try again.",
    token_exchange_failed: "Could not complete Google sign-in.",
    userinfo_failed: "Could not load your Google profile.",
    incomplete_profile: "Google did not return enough profile data.",
    oauth_not_configured: "Google sign-in is not configured on the server.",
    no_access_token: "Google sign-in failed (no token).",
    sign_in_failed: "Google sign-in failed. Check the server log or try again.",
  };
  return map[code] ?? code.replace(/_/g, " ");
}

type LoginFormProps = {
  /** When true, primary submit sits at the bottom of a tall parent (e.g. auth modal). */
  anchorSubmitToBottom?: boolean;
  /** Called after a successful email/password login (e.g. close auth modal). */
  onAuthenticated?: () => void;
};

export default function LoginPage({
  anchorSubmitToBottom = false,
  onAuthenticated,
}: LoginFormProps) {
  const formId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const oauthErrorParam = searchParams.get("error");

  const googleHref = useMemo(() => {
    const sp = new URLSearchParams();
    if (redirectTo && redirectTo !== "/") sp.set("redirect", redirectTo);
    const q = sp.toString();
    return q ? `/api/auth/google?${q}` : "/api/auth/google";
  }, [redirectTo]);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    oauthErrorParam ? oauthErrorMessage(oauthErrorParam) : null
  );
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const parsed = loginCredentialsSchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      setFieldErrors({
        email: flat.fieldErrors.email?.[0],
        password: flat.fieldErrors.password?.[0],
      });
      return;
    }

    const { email, password } = parsed.data;
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to log in"
        );
      }

      onAuthenticated?.();
      if (onAuthenticated) {
        await new Promise((r) => setTimeout(r, 260));
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  const topBlock = (
    <>
      <form id={formId} onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border border-border px-3 py-2"
            disabled={pending}
            aria-invalid={fieldErrors.email ? true : undefined}
          />
          {fieldErrors.email ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-lg border border-border px-3 py-2"
            disabled={pending}
            aria-invalid={fieldErrors.password ? true : undefined}
          />
          {fieldErrors.password ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <a
        href={googleHref}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
      >
        <GoogleGlyph />
        Continue with Google
      </a>
    </>
  );

  const submitBtn = (
    <button
      type="submit"
      form={formId}
      disabled={pending}
      className="global-button hover:bg-button/90 w-full shrink-0 disabled:opacity-60"
    >
      {pending ? "Logging in…" : "Log In"}
    </button>
  );

  if (anchorSubmitToBottom) {
    return (
      <div className="mx-auto flex h-full min-h-0 w-full max-w-sm flex-col p-6">
        <div className="shrink-0 space-y-4">{topBlock}</div>
        <div className="min-h-0 flex-1" aria-hidden />
        {submitBtn}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 p-6">
      {topBlock}
      {submitBtn}
    </div>
  );
}
