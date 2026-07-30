"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { business } from "@/content/config/business";
import { Button } from "./Button";
import { FeedbackBanner } from "./toast";

/**
 * Restyled admin login. Posts to the existing /api/admin/login (unchanged),
 * then refreshes so the server layout re-checks the session cookie and renders
 * the shell.
 */
export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Invalid password.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-atlas-navy px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white p-7 shadow-soft">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-atlas-navy">
          <Lock aria-hidden="true" className="h-5 w-5 text-atlas-gold" />
        </div>
        <h1 className="mt-4 font-serif text-2xl text-atlas-navy">{business.shortName} admin</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the admin password to manage site content.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label htmlFor="admin-password" className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-atlas-line bg-white px-3 py-2.5 text-sm text-atlas-ink outline-none transition focus:border-atlas-gold"
            />
          </label>

          {error && <FeedbackBanner tone="error">{error}</FeedbackBanner>}

          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
