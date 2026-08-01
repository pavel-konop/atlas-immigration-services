import crypto from "node:crypto";
import { services } from "@/content/services";
import { getArticles } from "@/lib/content/articles";
import { getEditableFaqs, getSiteContent, mergeServiceOverride } from "@/lib/admin/content";
import type { JsonObject } from "@/lib/ai/database/types";

/**
 * Builds the approved local content (services, FAQs, articles) into indexable
 * documents. Shared by the `ai:index` CLI and the admin reindex action so the
 * indexing contract lives in one place.
 */

export type IndexDoc = {
  sourceType: "service" | "faq" | "article";
  sourceId: string;
  title: string;
  slug: string | null;
  href: string;
  summary: string | null;
  body: string;
  language: string;
  metadata: JsonObject;
};

/** Stable hash of the fields that make up a document's indexed content. */
export function contentHash(doc: IndexDoc): string {
  const canonical = JSON.stringify({
    title: doc.title,
    href: doc.href,
    summary: doc.summary,
    body: doc.body,
    metadata: doc.metadata
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

/** Convert the article loader's HTML back to plain text for indexing. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*\/?\s*(p|div|li|h[1-6]|br|ul|ol|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

type Content = Awaited<ReturnType<typeof getSiteContent>>;

function buildServiceDocs(content: Content): IndexDoc[] {
  return services.map((base) => {
    const service = mergeServiceOverride(base, content);
    const body = [
      service.summary,
      service.description,
      `Outcomes:\n${service.outcomes.map((o) => `- ${o}`).join("\n")}`,
      `Process:\n${service.process.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
      `Documents to prepare:\n${service.documents.map((d) => `- ${d}`).join("\n")}`
    ].join("\n\n");

    return {
      sourceType: "service",
      sourceId: service.slug,
      title: service.title,
      slug: service.slug,
      href: `/services/${service.slug}`,
      summary: service.summary,
      body,
      language: "en",
      metadata: { category: service.category, audience: service.audience }
    };
  });
}

function buildFaqDocs(content: Content): IndexDoc[] {
  return getEditableFaqs(content).map((faq) => ({
    sourceType: "faq",
    sourceId: faq.id,
    title: faq.question,
    slug: null,
    href: "/faq",
    summary: null,
    body: faq.answer,
    language: "en",
    metadata: { category: faq.category }
  }));
}

async function buildArticleDocs(content: Content): Promise<IndexDoc[]> {
  const articles = await getArticles(content);
  return articles.map((article) => ({
    sourceType: "article",
    sourceId: article.slug,
    title: article.title,
    slug: article.slug,
    href: `/insights/${article.slug}`,
    summary: article.description || null,
    body: htmlToText(article.html),
    language: "en",
    metadata: { category: article.category, date: article.date, featured: article.featured }
  }));
}

/** Load admin-merged content and build the full set of indexable documents. */
export async function buildLocalDocs(): Promise<IndexDoc[]> {
  const content = await getSiteContent();
  return [...buildServiceDocs(content), ...buildFaqDocs(content), ...(await buildArticleDocs(content))];
}
