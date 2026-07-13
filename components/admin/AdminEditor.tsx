"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { FAQItem, FeedbackItem, InsightItem, PhotoItem, SiteContent } from "@/types/admin-content";

type Status = {
  tone: "neutral" | "success" | "error";
  message: string;
};

type AdminTab = "showcase" | "photos" | "feedbacks" | "insights" | "faqs" | "json";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "showcase", label: "Homepage" },
  { id: "photos", label: "Photos" },
  { id: "feedbacks", label: "Feedback" },
  { id: "insights", label: "Articles / Insights" },
  { id: "faqs", label: "FAQ" },
  { id: "json", label: "Advanced JSON" }
];

export function AdminEditor() {
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("showcase");
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

  function updateContent(updater: (draft: SiteContent) => void) {
    setContent((current) => {
      if (!current) return current;
      const draft = structuredClone(current);
      updater(draft);
      setJsonDraft(JSON.stringify(draft, null, 2));
      return draft;
    });
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
    setStatus({ tone: "success", message: "Saved. Public pages now read the updated shared content." });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setContent(null);
    setJsonDraft("");
    setStatus({ tone: "neutral", message: "Logged out." });
  }

  if (!isLoggedIn || !content) {
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

  const activeContent = content;

  return (
    <main className="min-h-screen bg-[#061a34] text-white">
      <header className="border-b border-white/10 bg-[#071d3a]/92 backdrop-blur">
        <div className="container-shell flex flex-col justify-between gap-4 py-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Atlas Admin</p>
            <h1 className="font-serif text-3xl">Manage shared website content</h1>
            <p className="mt-2 text-sm text-white/62">V1 and V2 both use this same content source.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/7 px-4 text-sm font-semibold">
              Preview site <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-atlas-gold px-4 text-sm font-semibold text-atlas-navy disabled:opacity-60"
            >
              <Save aria-hidden="true" className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={logout} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/7 px-4 text-sm font-semibold">
              <LogOut aria-hidden="true" className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="container-shell grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="content-start rounded-md border border-white/10 bg-white/[0.04] p-3">
          <nav className="grid gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-4 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.id ? "bg-atlas-gold text-atlas-navy" : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <StatusLine status={status} />
        </aside>

        <section className="rounded-md border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          {activeTab === "showcase" ? <ShowcaseAdmin content={activeContent} updateContent={updateContent} /> : null}
          {activeTab === "photos" ? <PhotosAdmin content={activeContent} updateContent={updateContent} /> : null}
          {activeTab === "feedbacks" ? <FeedbackAdmin content={activeContent} updateContent={updateContent} /> : null}
          {activeTab === "insights" ? <InsightsAdmin content={activeContent} updateContent={updateContent} /> : null}
          {activeTab === "faqs" ? <FaqAdmin content={activeContent} updateContent={updateContent} /> : null}
          {activeTab === "json" ? (
            <AdvancedJsonAdmin jsonDraft={jsonDraft} setJsonDraft={setJsonDraft} parsedDraft={parsedDraft} setContent={setContent} />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function ShowcaseAdmin({ content, updateContent }: AdminPanelProps) {
  const references = [
    ...content.contentLibrary.photos.map((item) => ({ type: "photo" as const, id: item.id, label: item.title })),
    ...content.contentLibrary.feedbacks.map((item) => ({ type: "feedback" as const, id: item.id, label: item.title })),
    ...content.contentLibrary.insights.map((item) => ({ type: "article" as const, id: item.slug, label: item.title }))
  ];

  return (
    <Panel title="Homepage rolling section" description="Choose whether the homepage shows recent insights automatically or a manual mix of photos, feedback, and articles. This powers both v1 and v2.">
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Eyebrow" value={content.showcase.eyebrow} onChange={(value) => updateContent((draft) => void (draft.showcase.eyebrow = value))} />
          <NumberField
            label="Recent insight count"
            value={content.showcase.recentInsightCount}
            onChange={(value) => updateContent((draft) => void (draft.showcase.recentInsightCount = value))}
          />
        </div>
        <TextField label="Title" value={content.showcase.title} onChange={(value) => updateContent((draft) => void (draft.showcase.title = value))} />
        <div className="grid gap-2">
          <span className="text-sm font-semibold text-white/82">Homepage mode</span>
          <div className="flex flex-wrap gap-3">
            {[
              ["recentInsights", "Photos + feedback + most recent insights"],
              ["manual", "Manual selection"]
            ].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => updateContent((draft) => void (draft.showcase.mode = mode as SiteContent["showcase"]["mode"]))}
                className={`rounded-md border px-4 py-3 text-sm font-semibold ${
                  content.showcase.mode === mode ? "border-atlas-gold bg-atlas-gold text-atlas-navy" : "border-white/14 bg-white/5 text-white/74"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-[#04152b] p-4">
          <p className="text-sm font-semibold">Manual homepage items</p>
          <p className="mt-1 text-sm leading-6 text-white/56">Used when homepage mode is manual. Recent mode still keeps this list saved for later.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {references.map((reference) => {
              const selected = content.showcase.selectedItems.some((item) => item.type === reference.type && item.id === reference.id);
              return (
                <label key={`${reference.type}-${reference.id}`} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) =>
                      updateContent((draft) => {
                        if (event.target.checked) {
                          draft.showcase.selectedItems.push({ type: reference.type, id: reference.id });
                        } else {
                          draft.showcase.selectedItems = draft.showcase.selectedItems.filter((item) => !(item.type === reference.type && item.id === reference.id));
                        }
                      })
                    }
                  />
                  <span>
                    <span className="font-semibold capitalize text-atlas-gold">{reference.type}</span> {reference.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PhotosAdmin({ content, updateContent }: AdminPanelProps) {
  return (
    <Panel title="Photos" description="Manage image tiles used by the rolling homepage section. Use public image paths such as /images/example.png.">
      <ActionButton label="Add photo" onClick={() => updateContent((draft) => draft.contentLibrary.photos.unshift(newPhoto()))} />
      <div className="mt-5 grid gap-4">
        {content.contentLibrary.photos.map((item, index) => (
          <Card key={item.id} title={item.title || "Untitled photo"} enabled={item.enabled}>
            <EntityTools
              enabled={item.enabled}
              onToggle={() => updateContent((draft) => void (draft.contentLibrary.photos[index].enabled = !draft.contentLibrary.photos[index].enabled))}
              onDelete={() => updateContent((draft) => void draft.contentLibrary.photos.splice(index, 1))}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField label="ID" value={item.id} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.photos[index].id = slugify(value)))} />
              <TextField label="Image path" value={item.image} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.photos[index].image = value))} />
              <TextField label="Title" value={item.title} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.photos[index].title = value))} />
              <TextField label="Link" value={item.href} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.photos[index].href = value))} />
            </div>
            <TextareaField label="Context" value={item.context} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.photos[index].context = value))} />
          </Card>
        ))}
      </div>
    </Panel>
  );
}

function FeedbackAdmin({ content, updateContent }: AdminPanelProps) {
  return (
    <Panel title="Feedback" description="Manage testimonial-style cards. Feedback cards intentionally do not need photos.">
      <ActionButton label="Add feedback" onClick={() => updateContent((draft) => draft.contentLibrary.feedbacks.unshift(newFeedback()))} />
      <div className="mt-5 grid gap-4">
        {content.contentLibrary.feedbacks.map((item, index) => (
          <Card key={item.id} title={item.title || "Untitled feedback"} enabled={item.enabled}>
            <EntityTools
              enabled={item.enabled}
              onToggle={() => updateContent((draft) => void (draft.contentLibrary.feedbacks[index].enabled = !draft.contentLibrary.feedbacks[index].enabled))}
              onDelete={() => updateContent((draft) => void draft.contentLibrary.feedbacks.splice(index, 1))}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField label="ID" value={item.id} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.feedbacks[index].id = slugify(value)))} />
              <TextField label="Title" value={item.title} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.feedbacks[index].title = value))} />
              <TextField label="Link" value={item.href} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.feedbacks[index].href = value))} />
            </div>
            <TextareaField label="Feedback text" value={item.context} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.feedbacks[index].context = value))} />
          </Card>
        ))}
      </div>
    </Panel>
  );
}

function InsightsAdmin({ content, updateContent }: AdminPanelProps) {
  return (
    <Panel title="Articles / Insights" description="Manage the public Insights index, article pages, and homepage article tiles. Newest enabled items appear first.">
      <ActionButton label="Add insight" onClick={() => updateContent((draft) => draft.contentLibrary.insights.unshift(newInsight()))} />
      <div className="mt-5 grid gap-4">
        {content.contentLibrary.insights.map((item, index) => (
          <Card key={item.slug} title={item.title || "Untitled insight"} enabled={item.enabled}>
            <EntityTools
              enabled={item.enabled}
              onToggle={() => updateContent((draft) => void (draft.contentLibrary.insights[index].enabled = !draft.contentLibrary.insights[index].enabled))}
              onDelete={() => updateContent((draft) => void draft.contentLibrary.insights.splice(index, 1))}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField label="Slug" value={item.slug} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].slug = slugify(value)))} />
              <TextField label="Date" value={item.date} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].date = value))} />
              <TextField label="Category" value={item.category} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].category = value))} />
              <TextField label="Image path" value={item.image} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].image = value))} />
            </div>
            <TextField label="Title" value={item.title} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].title = value))} />
            <TextareaField label="Description" value={item.description} onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].description = value))} />
            <TextareaField
              label="Article body (Markdown supported)"
              value={item.content}
              minHeight="min-h-[280px]"
              onChange={(value) => updateContent((draft) => void (draft.contentLibrary.insights[index].content = value))}
            />
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-white/80">
              <input type="checkbox" checked={item.featured} onChange={(event) => updateContent((draft) => void (draft.contentLibrary.insights[index].featured = event.target.checked))} />
              Featured insight
            </label>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

function FaqAdmin({ content, updateContent }: AdminPanelProps) {
  return (
    <Panel title="FAQ" description="Manage FAQ page content. These answers are also shaped to become part of the future AI assistant knowledge base.">
      <ActionButton label="Add FAQ" onClick={() => updateContent((draft) => draft.faqs.unshift(newFaq()))} />
      <div className="mt-5 grid gap-4">
        {content.faqs.map((item, index) => (
          <Card key={item.id} title={item.question || "Untitled FAQ"} enabled={item.enabled}>
            <EntityTools
              enabled={item.enabled}
              onToggle={() => updateContent((draft) => void (draft.faqs[index].enabled = !draft.faqs[index].enabled))}
              onDelete={() => updateContent((draft) => void draft.faqs.splice(index, 1))}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField label="ID" value={item.id} onChange={(value) => updateContent((draft) => void (draft.faqs[index].id = slugify(value)))} />
              <SelectField
                label="Category"
                value={item.category}
                options={["General", "Immigration", "Corporate"]}
                onChange={(value) => updateContent((draft) => void (draft.faqs[index].category = value as FAQItem["category"]))}
              />
            </div>
            <TextField label="Question" value={item.question} onChange={(value) => updateContent((draft) => void (draft.faqs[index].question = value))} />
            <TextareaField label="Answer" value={item.answer} onChange={(value) => updateContent((draft) => void (draft.faqs[index].answer = value))} />
          </Card>
        ))}
      </div>
    </Panel>
  );
}

function AdvancedJsonAdmin({
  jsonDraft,
  setJsonDraft,
  parsedDraft,
  setContent
}: {
  jsonDraft: string;
  setJsonDraft: (value: string) => void;
  parsedDraft: { ok: true; value: SiteContent } | { ok: false; message: string };
  setContent: (content: SiteContent) => void;
}) {
  return (
    <Panel title="Advanced JSON" description="Use this only for bulk edits. Structured tabs will refresh from this JSON when it is valid.">
      <textarea
        value={jsonDraft}
        onChange={(event) => {
          setJsonDraft(event.target.value);
          try {
            setContent(JSON.parse(event.target.value) as SiteContent);
          } catch {
            // Keep the structured editor on the last valid state until JSON is valid again.
          }
        }}
        spellCheck={false}
        className="min-h-[70vh] w-full rounded-md border border-white/10 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100"
      />
      {!parsedDraft.ok ? <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{parsedDraft.message}</p> : null}
    </Panel>
  );
}

type AdminPanelProps = {
  content: SiteContent;
  updateContent: (updater: (draft: SiteContent) => void) => void;
};

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Content management</p>
        <h2 className="mt-2 font-serif text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Card({ title, enabled, children }: { title: string; enabled: boolean; children: ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-[#071d3a] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${enabled ? "bg-green-400/12 text-green-100" : "bg-white/8 text-white/50"}`}>
          {enabled ? "Enabled" : "Hidden"}
        </span>
      </div>
      {children}
    </div>
  );
}

function EntityTools({ enabled, onToggle, onDelete }: { enabled: boolean; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button onClick={onToggle} className="rounded-md border border-white/12 bg-white/7 px-3 py-2 text-sm font-semibold">
        {enabled ? "Hide" : "Enable"}
      </button>
      <button onClick={onDelete} className="inline-flex items-center gap-2 rounded-md border border-red-300/24 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100">
        <Trash2 aria-hidden="true" className="h-4 w-4" /> Delete
      </button>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-atlas-navy transition hover:bg-atlas-gold">
      <Plus aria-hidden="true" className="h-4 w-4" /> {label}
    </button>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-md border border-white/10 bg-white px-3 text-atlas-navy" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <input
        value={value}
        min={1}
        max={12}
        type="number"
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-11 rounded-md border border-white/10 bg-white px-3 text-atlas-navy"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-md border border-white/10 bg-white px-3 text-atlas-navy">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  label,
  value,
  minHeight = "min-h-28",
  onChange
}: {
  label: string;
  value: string;
  minHeight?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${minHeight} rounded-md border border-white/10 bg-white p-3 text-atlas-navy`} />
    </label>
  );
}

function StatusLine({ status }: { status: Status }) {
  return (
    <p
      className={
        status.tone === "success"
          ? "mt-4 rounded-md border border-green-300/24 bg-green-400/10 p-3 text-sm text-green-100"
          : status.tone === "error"
            ? "mt-4 rounded-md border border-red-300/24 bg-red-500/10 p-3 text-sm text-red-100"
            : "mt-4 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/58"
      }
    >
      {status.message}
    </p>
  );
}

function newPhoto(): PhotoItem {
  const id = `photo-${Date.now()}`;
  return {
    id,
    title: "New photo",
    context: "Short context for this image.",
    image: "/images/atlas-consultation-team.png",
    href: "/contact",
    enabled: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };
}

function newFeedback(): FeedbackItem {
  return {
    id: `feedback-${Date.now()}`,
    title: "New feedback",
    context: "Client feedback goes here.",
    href: "/about",
    enabled: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };
}

function newInsight(): InsightItem {
  return {
    slug: `new-insight-${Date.now()}`,
    title: "New insight",
    description: "Short description for the insight index and homepage tile.",
    date: new Date().toISOString().slice(0, 10),
    category: "Immigration",
    image: "/images/atlas-corporate-review.png",
    content: "Intro paragraph.\n\n## Section heading\n\nArticle body goes here.",
    featured: false,
    enabled: true
  };
}

function newFaq(): FAQItem {
  return {
    id: `faq-${Date.now()}`,
    category: "General",
    question: "New question?",
    answer: "Answer goes here.",
    enabled: true
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
