import { revalidateTag, unstable_cache } from "next/cache";
import { faqs as fallbackFaqs } from "@/content/faqs";
import siteContentSeed from "@/content/admin/site-content.json";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import {
  getContentVersion,
  getCurrentContentRow,
  insertContentVersion,
  listContentVersions,
  type ContentVersionMeta
} from "./contentStore";
import type { FAQItem, FeedbackItem, InsightItem, PhotoItem, ShowcaseItem, ShowcaseReference, SiteContent } from "@/types/admin-content";

/**
 * Site content is stored in Postgres (`site_content_versions`, newest = current).
 * The bundled JSON is only a seed/fallback, no longer the runtime source of truth.
 */

export const SITE_CONTENT_TAG = "site-content";

export type { ContentVersionMeta };

export type SaveSiteContentResult =
  | { ok: true; version: number; content: SiteContent }
  | { ok: false; currentVersion: number };

/** Raw current document from the DB, or null (unconfigured / empty / read error). */
async function loadCurrentDocRaw(): Promise<SiteContent | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    return (await getCurrentContentRow())?.content ?? null;
  } catch {
    return null;
  }
}

// Public reads are served from Next's Data Cache (tag-invalidated on save), so
// page renders don't hit Postgres on every request.
const loadCurrentDocCached = unstable_cache(loadCurrentDocRaw, ["site-content-current"], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 300
});

async function loadCurrentDoc(): Promise<SiteContent | null> {
  try {
    return await loadCurrentDocCached();
  } catch {
    // unstable_cache can't run outside a Next request context (e.g. the CLI
    // indexer) — fall back to an uncached read.
    return await loadCurrentDocRaw();
  }
}

function invalidateContentCache() {
  try {
    // Next 16 requires a cache profile; "max" purges the tag on demand.
    revalidateTag(SITE_CONTENT_TAG, "max");
  } catch {
    // revalidateTag is a no-op / throws outside a request context; ignore.
  }
}

/** Current site content (cached DB read; falls back to the bundled JSON seed). */
export async function getSiteContent(): Promise<SiteContent> {
  const doc = await loadCurrentDoc();
  return normalizeSiteContent((doc ?? (siteContentSeed as Partial<SiteContent>)) as Partial<SiteContent>);
}

/** Unconditional save (last-write-wins) — preserved for interface compatibility. */
export async function saveSiteContent(content: SiteContent): Promise<void> {
  await insertContentVersion({ content: normalizeSiteContent(content), author: "admin" });
  invalidateContentCache();
}

/** Fresh current version + content for the admin editor (uncached, for an accurate concurrency base). */
export async function getCurrentSiteContentVersion(): Promise<{ version: number; content: SiteContent } | null> {
  if (!isDatabaseConfigured()) return null;
  const row = await getCurrentContentRow();
  return row ? { version: row.version, content: normalizeSiteContent(row.content) } : null;
}

/** Concurrency-checked save: rejects when the store moved past `baseVersion`. */
export async function saveSiteContentVersion(input: {
  content: SiteContent;
  baseVersion: number;
  note?: string | null;
}): Promise<SaveSiteContentResult> {
  const normalized = normalizeSiteContent(input.content);
  const result = await insertContentVersion({
    content: normalized,
    baseVersion: input.baseVersion,
    note: input.note ?? null,
    author: "admin"
  });
  if (!result.ok) return result;
  invalidateContentCache();
  return { ok: true, version: result.version, content: normalized };
}

export async function listSiteContentVersions(limit = 100): Promise<ContentVersionMeta[]> {
  if (!isDatabaseConfigured()) return [];
  return listContentVersions(limit);
}

/** Write a past version's document back as a new version. */
export async function restoreSiteContentVersion(
  version: number
): Promise<
  | { ok: true; version: number; content: SiteContent }
  | { ok: false; notFound: boolean }
> {
  const doc = await getContentVersion(version);
  if (!doc) return { ok: false, notFound: true };
  const normalized = normalizeSiteContent(doc);
  const result = await insertContentVersion({
    content: normalized,
    note: `Restored from v${version}`,
    author: "admin"
  });
  if (!result.ok) return { ok: false, notFound: false };
  invalidateContentCache();
  return { ok: true, version: result.version, content: normalized };
}

export function mergeServiceOverride<T extends { slug: string }>(service: T, content: SiteContent): T {
  return { ...service, ...content.serviceOverrides[service.slug] };
}

export function mergeArticleOverride<T extends { slug: string }>(article: T, content: SiteContent): T {
  return { ...article, ...content.articleOverrides[article.slug] };
}

export function getHomepageShowcaseItems(content: SiteContent): ShowcaseItem[] {
  const normalized = normalizeSiteContent(content);
  const { photos, feedbacks, insights } = normalized.contentLibrary;
  const photoItems = photos.filter((item) => item.enabled).map(photoToShowcaseItem);
  const feedbackItems = feedbacks.filter((item) => item.enabled).map(feedbackToShowcaseItem);
  const articleItems = insights
    .filter((item) => item.enabled)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    .map(insightToShowcaseItem);

  if (normalized.showcase.mode === "manual" && normalized.showcase.selectedItems.length > 0) {
    return normalized.showcase.selectedItems
      .map((reference) => findShowcaseItem(reference, { photoItems, feedbackItems, articleItems }))
      .filter((item): item is ShowcaseItem => Boolean(item));
  }

  return [...photoItems, ...feedbackItems, ...articleItems.slice(0, normalized.showcase.recentInsightCount)];
}

export function getEditableFaqs(content: SiteContent): FAQItem[] {
  return normalizeSiteContent(content).faqs.filter((faq) => faq.enabled);
}

export function normalizeSiteContent(content: Partial<SiteContent>): SiteContent {
  const legacyItems = content.showcase?.items || [];
  const photos = content.contentLibrary?.photos || legacyItems.filter((item) => item.type === "photo").map(legacyPhotoToEntity);
  const feedbacks =
    content.contentLibrary?.feedbacks || legacyItems.filter((item) => item.type === "feedback").map(legacyFeedbackToEntity);
  const insights =
    content.contentLibrary?.insights || legacyItems.filter((item) => item.type === "article").map(legacyInsightToEntity);
  const selectedItems =
    content.showcase?.selectedItems ||
    legacyItems
      .filter((item) => item.enabled)
      .map((item) => ({ type: item.type, id: item.type === "article" ? slugFromHref(item.href) || item.id : item.id }));

  return {
    showcase: {
      eyebrow: content.showcase?.eyebrow || "Atlas in practice",
      title: content.showcase?.title || "Stories, updates, and Singapore support in motion",
      mode: content.showcase?.mode || "recentInsights",
      recentInsightCount: content.showcase?.recentInsightCount || 2,
      selectedItems
    },
    contentLibrary: {
      photos,
      feedbacks,
      insights
    },
    faqs:
      content.faqs ||
      fallbackFaqs.map((faq, index) => ({
        id: `faq-${index + 1}`,
        ...faq,
        enabled: true
      })),
    audienceJourney: content.audienceJourney || {
      eyebrow: "Choose your path",
      title: "Different Singapore goals, one guided process",
      slides: []
    },
    serviceOverrides: content.serviceOverrides || {},
    articleOverrides: content.articleOverrides || {}
  };
}

function findShowcaseItem(
  reference: ShowcaseReference,
  library: { photoItems: ShowcaseItem[]; feedbackItems: ShowcaseItem[]; articleItems: ShowcaseItem[] }
) {
  if (reference.type === "photo") return library.photoItems.find((item) => item.id === reference.id);
  if (reference.type === "feedback") return library.feedbackItems.find((item) => item.id === reference.id);
  return library.articleItems.find((item) => item.id === reference.id);
}

function photoToShowcaseItem(item: PhotoItem): ShowcaseItem {
  return {
    id: item.id,
    type: "photo",
    title: item.title,
    context: item.context,
    image: item.image,
    href: item.href,
    enabled: item.enabled
  };
}

function feedbackToShowcaseItem(item: FeedbackItem): ShowcaseItem {
  return {
    id: item.id,
    type: "feedback",
    title: item.title,
    context: item.context,
    image: "/images/atlas-founder-laptop.png",
    href: item.href,
    enabled: item.enabled
  };
}

function insightToShowcaseItem(item: InsightItem): ShowcaseItem {
  return {
    id: item.slug,
    type: "article",
    title: item.title,
    context: item.description,
    image: item.image,
    href: `/insights/${item.slug}`,
    enabled: item.enabled
  };
}

function legacyPhotoToEntity(item: ShowcaseItem): PhotoItem {
  return {
    id: item.id,
    title: item.title,
    context: item.context,
    image: item.image,
    href: item.href,
    enabled: item.enabled,
    createdAt: "2026-06-01"
  };
}

function legacyFeedbackToEntity(item: ShowcaseItem): FeedbackItem {
  return {
    id: item.id,
    title: item.title,
    context: item.context,
    href: item.href,
    enabled: item.enabled,
    createdAt: "2026-06-01"
  };
}

function legacyInsightToEntity(item: ShowcaseItem): InsightItem {
  const slug = slugFromHref(item.href) || item.id;
  return {
    slug,
    title: item.title,
    description: item.context,
    date: "2026-06-01",
    category: "Immigration",
    image: item.image,
    content: "",
    featured: true,
    enabled: item.enabled
  };
}

function slugFromHref(href: string) {
  return href.startsWith("/insights/") ? href.replace("/insights/", "") : "";
}
