/**
 * Chunker command — splits each enabled knowledge document's body into
 * `ai_knowledge_chunks` rows via the transactional `replaceDocumentChunks`.
 *
 * Does NOT touch embeddings (roadmap item 4), the item-2 indexer, migrations,
 * or the MOM importer.
 *
 * Re-run behavior:
 *   - A document whose chunks already reflect its current content_hash is
 *     skipped (no delete, no insert).
 *   - A changed document is fully re-chunked: replaceDocumentChunks deletes the
 *     old chunks and re-inserts from chunk_index 0 in one transaction.
 *   - --force always re-chunks, even when unchanged.
 *
 * Usage:
 *   npm run ai:chunk            # write chunks to the database
 *   npm run ai:chunk:dry-run    # report only, no writes
 *   npm run ai:chunk -- --force # re-chunk every enabled document
 */

import crypto from "node:crypto";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import {
  getChunksByDocument,
  listEnabledKnowledgeDocuments,
  replaceDocumentChunks,
  type ChunkInput
} from "@/lib/ai/database/repositories";
import { chunkDocument, estimateTokens } from "@/lib/ai/retrieval/chunking";

const flags = new Set(process.argv.slice(2));
const dryRun = flags.has("--dry-run");
const force = flags.has("--force");

function chunkContentHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function main() {
  if (!isDatabaseConfigured()) {
    console.error(
      "DATABASE_URL is not set. Add it to .env or export it before running ai:chunk."
    );
    process.exit(1);
  }

  const documents = await listEnabledKnowledgeDocuments(1000);
  console.log(
    `${dryRun ? "[dry-run] " : ""}Chunking ${documents.length} enabled document(s)${force ? " (force)" : ""}.`
  );

  const counts = { chunked: 0, rechunked: 0, unchanged: 0 };
  let totalChunks = 0;

  for (const doc of documents) {
    const texts = chunkDocument({
      sourceType: doc.sourceType,
      title: doc.title,
      body: doc.body
    });

    const chunks: ChunkInput[] = texts.map((chunkText, index) => ({
      chunkIndex: index,
      chunkText,
      tokenCount: estimateTokens(chunkText),
      contentHash: chunkContentHash(chunkText),
      metadata: { documentHash: doc.contentHash, sourceType: doc.sourceType }
    }));

    const existing = await getChunksByDocument(doc.id);
    const existingHash =
      existing.length > 0
        ? (existing[0].metadata as { documentHash?: string }).documentHash
        : undefined;
    const upToDate = existing.length > 0 && existingHash === doc.contentHash;

    const state: "chunked" | "rechunked" | "unchanged" =
      upToDate && !force ? "unchanged" : existing.length > 0 ? "rechunked" : "chunked";

    counts[state] += 1;

    if (state === "unchanged") {
      console.log(`  = ${doc.sourceType}/${doc.sourceId} (${existing.length} chunk(s), unchanged)`);
      continue;
    }

    totalChunks += chunks.length;
    console.log(
      `  ${state === "chunked" ? "+" : "~"} ${doc.sourceType}/${doc.sourceId} — ${chunks.length} chunk(s)`
    );

    if (dryRun) continue;

    await replaceDocumentChunks(doc.id, chunks);
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}Done — chunked ${counts.chunked}, rechunked ${counts.rechunked}, ` +
      `unchanged ${counts.unchanged}; ${totalChunks} chunk(s) written.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
