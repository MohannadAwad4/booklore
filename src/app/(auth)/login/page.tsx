"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to log in",
        );
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-lg border border-border px-3 py-2"
          disabled={pending}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-lg border border-border px-3 py-2"
          disabled={pending}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Logging in…" : "Log In"}
        </button>
      </form>
    </div>
  );
}