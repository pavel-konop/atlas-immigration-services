import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { FAQItem, SiteContent } from "@/types/admin-content";
import { cn } from "@/lib/utils/cn";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";
import { FeedbackBanner } from "../toast";
import { NumberField, SelectField, TextField, TextareaField, ToggleField } from "../fields";
import { ImageUploadField } from "./ImageUploadField";
import { newFaq, newFeedback, newInsight, newPhoto, slugify } from "./factories";

export type SectionProps = {
  content: SiteContent;
  update: (mutate: (draft: SiteContent) => void) => void;
};

/** A card for a single editable list item: title + status, delete, enable toggle. */
function ItemCard({
  title,
  enabled,
  onToggle,
  onDelete,
  children
}: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          {title}
          <Badge tone={enabled ? "success" : "neutral"}>{enabled ? "Enabled" : "Disabled"}</Badge>
        </span>
      }
      actions={
        <Button variant="danger" size="sm" onClick={onDelete} aria-label="Delete item">
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        <ToggleField label="Enabled" checked={enabled} onChange={onToggle} />
        {children}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ showcase */

export function ShowcaseSection({ content, update }: SectionProps) {
  const references = [
    ...content.contentLibrary.photos.map((i) => ({ type: "photo" as const, id: i.id, label: i.title })),
    ...content.contentLibrary.feedbacks.map((i) => ({ type: "feedback" as const, id: i.id, label: i.title })),
    ...content.contentLibrary.insights.map((i) => ({ type: "article" as const, id: i.slug, label: i.title }))
  ];

  return (
    <Card
      title="Homepage rolling section"
      description="Show recent insights automatically, or a manual mix of photos, feedback, and articles. Powers v1 and v2."
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Eyebrow"
            value={content.showcase.eyebrow}
            onChange={(v) => update((d) => void (d.showcase.eyebrow = v))}
          />
          <NumberField
            label="Recent insight count"
            value={content.showcase.recentInsightCount}
            onChange={(v) => update((d) => void (d.showcase.recentInsightCount = v))}
          />
        </div>
        <TextField
          label="Title"
          value={content.showcase.title}
          onChange={(v) => update((d) => void (d.showcase.title = v))}
        />

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Homepage mode
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["recentInsights", "Recent insights"],
                ["manual", "Manual selection"]
              ] as const
            ).map(([mode, label]) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={content.showcase.mode === mode ? "primary" : "secondary"}
                onClick={() => update((d) => void (d.showcase.mode = mode))}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-atlas-line bg-atlas-mist/40 p-4">
          <p className="text-sm font-semibold text-atlas-navy">Manual homepage items</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Used when the mode is Manual. Recent mode still keeps this list saved for later.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {references.map((ref) => {
              const selected = content.showcase.selectedItems.some((i) => i.type === ref.type && i.id === ref.id);
              return (
                <label
                  key={`${ref.type}-${ref.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md border bg-white p-3 text-sm",
                    selected ? "border-atlas-gold" : "border-atlas-line"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    className="h-4 w-4 rounded border-atlas-line text-atlas-navy focus:ring-atlas-gold"
                    onChange={(e) =>
                      update((d) => {
                        if (e.target.checked) {
                          d.showcase.selectedItems.push({ type: ref.type, id: ref.id });
                        } else {
                          d.showcase.selectedItems = d.showcase.selectedItems.filter(
                            (i) => !(i.type === ref.type && i.id === ref.id)
                          );
                        }
                      })
                    }
                  />
                  <span>
                    <span className="font-semibold capitalize text-atlas-blue">{ref.type}</span> {ref.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------- photos */

export function PhotosSection({ content, update }: SectionProps) {
  const photos = content.contentLibrary.photos;
  return (
    <div className="space-y-4">
      <SectionToolbar
        description="Image tiles for the rolling homepage section. Use public paths like /images/example.png."
        onAdd={() => update((d) => d.contentLibrary.photos.unshift(newPhoto()))}
        addLabel="Add photo"
      />
      {photos.length === 0 ? (
        <EmptyState title="No photos yet" description="Add a photo tile to feature it on the homepage." />
      ) : (
        photos.map((item, index) => (
          <ItemCard
            key={item.id}
            title={item.title || "Untitled photo"}
            enabled={item.enabled}
            onToggle={() => update((d) => void (d.contentLibrary.photos[index].enabled = !item.enabled))}
            onDelete={() => update((d) => void d.contentLibrary.photos.splice(index, 1))}
          >
            <ImageUploadField
              label="Photo"
              value={item.image}
              onChange={(v) => update((d) => void (d.contentLibrary.photos[index].image = v))}
              aspectRatio={2}
              folder="photos"
              hint="Cropped to 2:1 for the homepage tile."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField label="ID" value={item.id} onChange={(v) => update((d) => void (d.contentLibrary.photos[index].id = slugify(v)))} />
              <TextField label="Title" value={item.title} onChange={(v) => update((d) => void (d.contentLibrary.photos[index].title = v))} />
              <TextField label="Link" value={item.href} onChange={(v) => update((d) => void (d.contentLibrary.photos[index].href = v))} />
            </div>
            <TextareaField label="Context" value={item.context} onChange={(v) => update((d) => void (d.contentLibrary.photos[index].context = v))} />
          </ItemCard>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ feedback */

export function FeedbackSection({ content, update }: SectionProps) {
  const feedbacks = content.contentLibrary.feedbacks;
  return (
    <div className="space-y-4">
      <SectionToolbar
        description="Testimonial-style cards. Feedback cards intentionally do not need photos."
        onAdd={() => update((d) => d.contentLibrary.feedbacks.unshift(newFeedback()))}
        addLabel="Add feedback"
      />
      {feedbacks.length === 0 ? (
        <EmptyState title="No feedback yet" description="Add a testimonial card." />
      ) : (
        feedbacks.map((item, index) => (
          <ItemCard
            key={item.id}
            title={item.title || "Untitled feedback"}
            enabled={item.enabled}
            onToggle={() => update((d) => void (d.contentLibrary.feedbacks[index].enabled = !item.enabled))}
            onDelete={() => update((d) => void d.contentLibrary.feedbacks.splice(index, 1))}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="ID" value={item.id} onChange={(v) => update((d) => void (d.contentLibrary.feedbacks[index].id = slugify(v)))} />
              <TextField label="Title" value={item.title} onChange={(v) => update((d) => void (d.contentLibrary.feedbacks[index].title = v))} />
              <TextField label="Link" value={item.href} onChange={(v) => update((d) => void (d.contentLibrary.feedbacks[index].href = v))} />
            </div>
            <TextareaField label="Feedback text" value={item.context} onChange={(v) => update((d) => void (d.contentLibrary.feedbacks[index].context = v))} />
          </ItemCard>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ articles */

export function ArticlesSection({ content, update }: SectionProps) {
  const insights = content.contentLibrary.insights;
  return (
    <div className="space-y-4">
      <SectionToolbar
        description="The public Insights index, article pages, and homepage article tiles. Newest enabled items appear first."
        onAdd={() => update((d) => d.contentLibrary.insights.unshift(newInsight()))}
        addLabel="Add article"
      />
      {insights.length === 0 ? (
        <EmptyState title="No articles yet" description="Add an article / insight." />
      ) : (
        insights.map((item, index) => (
          <ItemCard
            key={item.slug}
            title={item.title || "Untitled article"}
            enabled={item.enabled}
            onToggle={() => update((d) => void (d.contentLibrary.insights[index].enabled = !item.enabled))}
            onDelete={() => update((d) => void d.contentLibrary.insights.splice(index, 1))}
          >
            <ImageUploadField
              label="Article image"
              value={item.image}
              onChange={(v) => update((d) => void (d.contentLibrary.insights[index].image = v))}
              aspectRatio={16 / 9}
              folder="articles"
              hint="Cropped to 16:9 for the showcase tile."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField label="Slug" value={item.slug} onChange={(v) => update((d) => void (d.contentLibrary.insights[index].slug = slugify(v)))} />
              <TextField label="Date" value={item.date} onChange={(v) => update((d) => void (d.contentLibrary.insights[index].date = v))} />
              <TextField label="Category" value={item.category} onChange={(v) => update((d) => void (d.contentLibrary.insights[index].category = v))} />
            </div>
            <TextField label="Title" value={item.title} onChange={(v) => update((d) => void (d.contentLibrary.insights[index].title = v))} />
            <TextareaField label="Description" value={item.description} onChange={(v) => update((d) => void (d.contentLibrary.insights[index].description = v))} />
            <TextareaField
              label="Article body (Markdown supported)"
              rows={12}
              value={item.content}
              onChange={(v) => update((d) => void (d.contentLibrary.insights[index].content = v))}
            />
            <ToggleField
              label="Featured insight"
              checked={item.featured}
              onChange={(c) => update((d) => void (d.contentLibrary.insights[index].featured = c))}
            />
          </ItemCard>
        ))
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- faq */

const FAQ_CATEGORIES: readonly FAQItem["category"][] = ["General", "Immigration", "Corporate"];

export function FaqSection({ content, update }: SectionProps) {
  const faqs = content.faqs;
  return (
    <div className="space-y-4">
      <SectionToolbar
        description="FAQ page answers. These are also shaped to feed the assistant's knowledge base."
        onAdd={() => update((d) => d.faqs.unshift(newFaq()))}
        addLabel="Add FAQ"
      />
      {faqs.length === 0 ? (
        <EmptyState title="No FAQs yet" description="Add a question and answer." />
      ) : (
        faqs.map((item, index) => (
          <ItemCard
            key={item.id}
            title={item.question || "Untitled FAQ"}
            enabled={item.enabled}
            onToggle={() => update((d) => void (d.faqs[index].enabled = !item.enabled))}
            onDelete={() => update((d) => void d.faqs.splice(index, 1))}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="ID" value={item.id} onChange={(v) => update((d) => void (d.faqs[index].id = slugify(v)))} />
              <SelectField
                label="Category"
                value={item.category}
                options={FAQ_CATEGORIES}
                onChange={(v) => update((d) => void (d.faqs[index].category = v as FAQItem["category"]))}
              />
            </div>
            <TextField label="Question" value={item.question} onChange={(v) => update((d) => void (d.faqs[index].question = v))} />
            <TextareaField label="Answer" value={item.answer} onChange={(v) => update((d) => void (d.faqs[index].answer = v))} />
          </ItemCard>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------- advanced JSON */

export function AdvancedJsonSection({
  draft,
  parseError,
  onDraftChange
}: {
  draft: string;
  parseError: string | null;
  onDraftChange: (value: string) => void;
}) {
  return (
    <Card
      title="Advanced JSON"
      description="Bulk-edit the raw content, including audience journey and service/article overrides. Structured sections refresh when the JSON is valid."
    >
      <div className="space-y-3">
        {parseError ? (
          <FeedbackBanner tone="error">Invalid JSON — changes are paused until it parses. {parseError}</FeedbackBanner>
        ) : (
          <FeedbackBanner tone="info">JSON is valid and in sync with the structured sections.</FeedbackBanner>
        )}
        <textarea
          value={draft}
          spellCheck={false}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={22}
          className="w-full rounded-md border border-atlas-line bg-white px-3 py-2 font-mono text-xs leading-6 text-atlas-ink outline-none focus:border-atlas-gold"
        />
      </div>
    </Card>
  );
}

/* ----------------------------------------------------------------- toolbar */

function SectionToolbar({ description, onAdd, addLabel }: { description: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      <Button variant="secondary" size="sm" onClick={onAdd} className="self-start">
        <Plus aria-hidden="true" className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
