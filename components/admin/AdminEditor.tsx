"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { SiteContent } from "@/types/admin-content";

type Status = {
  tone: "neutral" | "success" | "error";
  message: string;
};

export function AdminEditor() {
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [status, setStatus] = useState<Status>({ tone: "neutral", message: "Loading admin content..." });
  const [saving, setSaving] = useState(false);
  const isLoggedIn = Boolean(content);

  useEffect(() => {
    void loadContent();
  }, []);

  const parsedDraft = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(jsonDraft) as SiteContent };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : "Invalid JSON" };
    }
  }, [jsonDraft]);

  async function loadContent() {
    const response = await fetch("/api/admin/content");
    if (response.status === 401) {
      setStatus({ tone: "neutral", message: "Enter the admin password to manage site content." });
      return;
    }
    const result = await response.json();
    if (result.ok) {
      setContent(result.content);
      setJsonDraft(JSON.stringify(result.content, null, 2));
      setStatus({ tone: "success", message: "Content loaded." });
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      setStatus({ tone: "error", message: "That password did not work." });
      return;
    }
    setPassword("");
    await loadContent();
  }

  async function save() {
    if (!parsedDraft.ok) {
      setStatus({ tone: "error", message: `Cannot save: ${parsedDraft.message}` });
      return;
    }
    setSaving(true);
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: parsedDraft.value })
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok || !result.ok) {
      setStatus({ tone: "error", message: result.message || "Save failed." });
      return;
    }
    setContent(result.content);
    setJsonDraft(JSON.stringify(result.content, null, 2));
    setStatus({ tone: "success", message: "Saved. Public pages now read the updated content." });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setJsonDraft("");
    setStatus({ tone: "neutral", message: "Logged out." });
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-atlas-navy px-4 py-16 text-white">
        <div className="mx-auto max-w-md rounded-md border border-white/15 bg-white/7 p-6 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Atlas Admin</p>
          <h1 className="mt-4 font-serif text-4xl">Content login</h1>
          <p className="mt-3 leading-7 text-white/70">Use `ADMIN_PASSWORD` from the environment. Local fallback is `atlas-admin`.</p>
          <form onSubmit={login} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="min-h-12 rounded-md border border-white/15 bg-white px-3 text-atlas-navy"
              />
            </label>
            <button className="min-h-12 rounded-md bg-atlas-gold px-5 text-sm font-semibold text-atlas-navy">Log in</button>
          </form>
          <StatusLine status={status} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-atlas-cream">
      <header className="border-b border-atlas-line bg-white">
        <div className="container-shell flex flex-col justify-between gap-4 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Atlas Admin</p>
            <h1 className="font-serif text-3xl text-atlas-navy">Manage website content</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-atlas-line bg-white px-4 text-sm font-semibold text-atlas-navy">
              Preview site <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-atlas-gold px-4 text-sm font-semibold text-atlas-navy disabled:opacity-60"
            >
              <Save aria-hidden="true" className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={logout} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-atlas-line bg-white px-4 text-sm font-semibold text-atlas-navy">
              <LogOut aria-hidden="true" className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </header>
      <div className="container-shell grid gap-6 py-8 lg:grid-cols-[0.7fr_0.3fr]">
        <section className="rounded-md border border-atlas-line bg-white p-4 shadow-sm">
          <label className="grid gap-3">
            <span className="font-semibold text-atlas-navy">Editable site content JSON</span>
            <textarea
              value={jsonDraft}
              onChange={(event) => setJsonDraft(event.target.value)}
              spellCheck={false}
              className="min-h-[70vh] rounded-md border border-atlas-line bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100"
            />
          </label>
        </section>
        <aside className="grid content-start gap-4">
          <div className="rounded-md border border-atlas-line bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-atlas-navy">What this controls</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              <li>Continuous photos / feedback / article rail</li>
              <li>Fixed horizontal audience journey</li>
              <li>Service title, summary, and description overrides</li>
              <li>Article title, description, category, and featured overrides</li>
            </ul>
          </div>
          <div className="rounded-md border border-atlas-line bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-atlas-navy">Quick examples</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Add an item under `showcase.items`, choose `photo`, `feedback`, or `article`, attach context, image path, and
              a link. Use `enabled: false` to hide it without deleting it.
            </p>
          </div>
          <StatusLine status={status} />
          {!parsedDraft.ok ? <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{parsedDraft.message}</p> : null}
        </aside>
      </div>
    </main>
  );
}

function StatusLine({ status }: { status: Status }) {
  return (
    <p
      className={
        status.tone === "success"
          ? "mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          : status.tone === "error"
            ? "mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            : "mt-4 rounded-md border border-atlas-line bg-white/10 p-3 text-sm text-slate-600"
      }
    >
      {status.message}
    </p>
  );
}
