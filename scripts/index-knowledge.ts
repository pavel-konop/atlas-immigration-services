/**
 * Knowledge indexer — syncs already-approved local Atlas content into the
 * `ai_knowledge_documents` table via `upsertKnowledgeDocument`.
 *
 * Sources (all effective/admin-merged, not raw files):
 *   - services   → content/services + admin serviceOverrides
 *   - faqs       → admin faqs (seeded from content/faqs), enabled only
 *   - articles   → content/articles/*.md + admin insights, enabled only
 *
 * Out of scope by design: chunking and embeddings (roadmap item 3+), the MOM
 * importer, migrations, and content/knowledge/approved-guidance.ts.
 *
 * Usage:
 *   npm run ai:index            # write to the database
 *   npm run ai:index:dry-run    # report only, no writes
 */

import crypto from "node:crypto";
import { services } from "@/content/services";
import { getArticles } from "@/lib/content/articles";
import { getEditableFaqs, getSiteContent, mergeServiceOverride } from "@/lib/admin/content";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import {
  getKnowledgeDocumentBySource,
  markKnowledgeDocumentIndexed,
  upsertKnowledgeDocument,
  type UpsertKnowledgeDocumentInput
} from "@/lib/ai/database/repositories";
import type { JsonObject } from "@/lib/ai/database/types";

const dryRun = process.argv.slice(2).includes("--dry-run");

type IndexDoc = {
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
function contentHash(doc: IndexDoc): string {
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
function htmlToText(html: string): string {
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

function buildServiceDocs(content: Awaited<ReturnType<typeof getSiteContent>>): IndexDoc[] {
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

function buildFaqDocs(content: Awaited<ReturnType<typeof getSiteContent>>): IndexDoc[] {
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

async function buildArticleDocs(
  content: Awaited<ReturnType<typeof getSiteContent>>
): Promise<IndexDoc[]> {
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

async function main() {
  if (!dryRun && !isDatabaseConfigured()) {
    console.error(
      "DATABASE_URL is not set. Add it to .env or export it before running ai:index (or use ai:index:dry-run)."
    );
    process.exit(1);
  }

  const content = await getSiteContent();
  const docs: IndexDoc[] = [
    ...buildServiceDocs(content),
    ...buildFaqDocs(content),
    ...(await buildArticleDocs(content))
  ];

  console.log(`${dryRun ? "[dry-run] " : ""}Preparing ${docs.length} document(s) to index.`);

  const canReadDb = isDatabaseConfigured();
  const counts = { created: 0, updated: 0, unchanged: 0 };

  for (const doc of docs) {
    const hash = contentHash(doc);
    const existing = canReadDb
      ? await getKnowledgeDocumentBySource(doc.sourceType, doc.sourceId)
      : null;
    const state: "created" | "updated" | "unchanged" = !existing
      ? "created"
      : existing.contentHash === hash
        ? "unchanged"
        : "updated";

    counts[state] += 1;

    if (state === "unchanged") {
      console.log(`  = ${doc.sourceType}/${doc.sourceId} (unchanged)`);
      continue;
    }

    console.log(`  ${state === "created" ? "+" : "~"} ${doc.sourceType}/${doc.sourceId} — ${doc.title}`);

    if (dryRun) continue;

    const input: UpsertKnowledgeDocumentInput = {
      sourceType: doc.sourceType,
      sourceId: doc.sourceId,
      title: doc.title,
      slug: doc.slug,
      href: doc.href,
      summary: doc.summary,
      body: doc.body,
      language: doc.language,
      metadata: doc.metadata,
      contentHash: hash,
      enabled: true,
      approvedBy: "content-indexer",
      approvedAt: new Date().toISOString()
    };
    const saved = await upsertKnowledgeDocument(input);
    await markKnowledgeDocumentIndexed(saved.id);
  }

  const summary = canReadDb
    ? `created ${counts.created}, updated ${counts.updated}, unchanged ${counts.unchanged}`
    : `${docs.length} document(s) would be synced (no DATABASE_URL, diff unavailable)`;
  console.log(`${dryRun ? "[dry-run] " : ""}Done — ${summary}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
