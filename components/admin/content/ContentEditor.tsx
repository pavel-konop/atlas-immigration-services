"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import type { SiteContent } from "@/types/admin-content";
import { cn } from "@/lib/utils/cn";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { FeedbackBanner, useToast } from "../toast";
import { LoadingState } from "../LoadingState";
import { PageHeader } from "../PageHeader";
import {
  AdvancedJsonSection,
  ArticlesSection,
  FaqSection,
  FeedbackSection,
  PhotosSection,
  ShowcaseSection,
  type SectionProps
} from "./sections";

type SectionId = "showcase" | "photos" | "feedback" | "articles" | "faqs" | "json";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "showcase", label: "Showcase" },
  { id: "photos", label: "Photos" },
  { id: "feedback", label: "Feedback" },
  { id: "articles", label: "Articles" },
  { id: "faqs", label: "FAQs" },
  { id: "json", label: "Advanced JSON" }
];

export function ContentEditor() {
  const router = useRouter();
  const toast = useToast();

  const [content, setContent] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState<SectionId>("showcase");
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const dirty = useMemo(
    () => Boolean(content && saved && JSON.stringify(content) !== JSON.stringify(saved)),
    [content, saved]
  );

  /** Redirect to login when the session has expired mid-use. */
  const handleSessionExpiry = useCallback(() => {
    toast.push("error", "Your session expired. Redirecting to login…");
    router.push("/admin");
    router.refresh();
  }, [router, toast]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/content");
      if (res.status === 401) {
        handleSessionExpiry();
        return;
      }
      const data = (await res.json().catch(() => null)) as { content?: SiteContent } | null;
      if (!res.ok || !data?.content) {
        setLoadError("Could not load content.");
        setLoading(false);
        return;
      }
      setContent(data.content);
      setSaved(data.content);
      setLoading(false);
    } catch {
      setLoadError("Could not reach the server.");
      setLoading(false);
    }
  }, [handleSessionExpiry]);

  useEffect(() => {
    // Fetch content on mount. `load` sets loading/error state — the intended use
    // of an effect for data fetching (the initial state already shows a loader).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const update: SectionProps["update"] = (mutate) => {
    setContent((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as SiteContent;
      mutate(draft);
      return draft;
    });
  };

  const switchTo = (id: SectionId) => {
    if (id === "json" && content) {
      setJsonDraft(JSON.stringify(content, null, 2));
      setJsonError(null);
    }
    setActive(id);
  };

  const onJsonDraftChange = (value: string) => {
    setJsonDraft(value);
    try {
      const parsed = JSON.parse(value) as SiteContent;
      setContent(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Parse error");
    }
  };

  const save = async () => {
    if (!content || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (res.status === 401) {
        handleSessionExpiry();
        return;
      }
      const data = (await res.json().catch(() => null)) as { content?: SiteContent; message?: string } | null;
      if (!res.ok || !data?.content) {
        toast.push("error", data?.message ?? "Save failed.");
        setSaving(false);
        return;
      }
      // Adopt the server-normalized content so the editor matches what's on disk.
      setContent(data.content);
      setSaved(data.content);
      if (active === "json") setJsonDraft(JSON.stringify(data.content, null, 2));
      toast.push("success", "Saved. Public pages now read the updated content.");
    } catch {
      toast.push("error", "Could not reach the server.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content"
        description="Edit the homepage showcase, photos, feedback, articles, and FAQs shown across the public site."
        actions={
          <>
            {dirty ? (
              <Badge tone="warning">● Unsaved changes</Badge>
            ) : (
              !loading && !loadError && <Badge tone="success">All changes saved</Badge>
            )}
            <Button onClick={save} loading={saving} disabled={!dirty || saving || Boolean(jsonError)}>
              <Save aria-hidden="true" className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      />

      {loading ? (
        <LoadingState label="Loading content…" />
      ) : loadError ? (
        <div className="space-y-3">
          <FeedbackBanner tone="error">{loadError}</FeedbackBanner>
          <Button variant="secondary" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : content ? (
        <>
          <div className="-mx-1 overflow-x-auto">
            <div className="flex gap-1 px-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => switchTo(section.id)}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition",
                    active === section.id
                      ? "bg-atlas-navy text-white"
                      : "text-slate-600 hover:bg-atlas-mist hover:text-atlas-navy"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {active === "showcase" && <ShowcaseSection content={content} update={update} />}
          {active === "photos" && <PhotosSection content={content} update={update} />}
          {active === "feedback" && <FeedbackSection content={content} update={update} />}
          {active === "articles" && <ArticlesSection content={content} update={update} />}
          {active === "faqs" && <FaqSection content={content} update={update} />}
          {active === "json" && (
            <AdvancedJsonSection draft={jsonDraft} parseError={jsonError} onDraftChange={onJsonDraftChange} />
          )}
        </>
      ) : null}
    </div>
  );
}
