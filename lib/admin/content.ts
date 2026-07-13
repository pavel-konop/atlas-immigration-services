import fs from "node:fs/promises";
import path from "node:path";
import { faqs as fallbackFaqs } from "@/content/faqs";
import type { FAQItem, FeedbackItem, InsightItem, PhotoItem, ShowcaseItem, ShowcaseReference, SiteContent } from "@/types/admin-content";

const contentPath = path.join(process.cwd(), "content/admin/site-content.json");

export async function getSiteContent(): Promise<SiteContent> {
  const file = await fs.readFile(contentPath, "utf8");
  return normalizeSiteContent(JSON.parse(file) as Partial<SiteContent>);
}

export async function saveSiteContent(content: SiteContent) {
  const normalized = normalizeSiteContent(content);
  await fs.writeFile(contentPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
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
