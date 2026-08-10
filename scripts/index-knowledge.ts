/**
 * Knowledge indexer — syncs already-approved local Atlas content into the
 * `ai_knowledge_documents` table via `upsertKnowledgeDocument`. Document
 * building lives in `lib/ai/indexing/localContent.ts`, shared with the admin
 * reindex action.
 *
 * Usage:
 *   npm run ai:index            # write to the database
 *   npm run ai:index:dry-run    # report only, no writes
 */

import { isDatabaseConfigured } from "@/lib/ai/database/client";
import {
  getKnowledgeDocumentBySource,
  markKnowledgeDocumentIndexed,
  upsertKnowledgeDocument,
  type UpsertKnowledgeDocumentInput
} from "@/lib/ai/database/repositories";
import { buildLocalDocs, contentHash } from "@/lib/ai/indexing/localContent";

const dryRun = process.argv.slice(2).includes("--dry-run");

async function main() {
  if (!dryRun && !isDatabaseConfigured()) {
    console.error(
      "DATABASE_URL is not set. Add it to .env or export it before running ai:index (or use ai:index:dry-run)."
    );
    process.exit(1);
  }

  const docs = await buildLocalDocs();
  console.log(`${dryRun ? "[dry-run] " : ""}Preparing ${docs.length} document(s) to index.`);

  const canReadDb = isDatabaseConfigured();
  const counts = { created: 0, updated: 0, unchanged: 0 };

  for (const doc of docs) {
    const hash = contentHash(doc);
    const existing = canReadDb ? await getKnowledgeDocumentBySource(doc.sourceType, doc.sourceId) : null;
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
