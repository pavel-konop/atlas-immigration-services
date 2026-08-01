import crypto from "node:crypto";
import {
  getChunksByDocument,
  getKnowledgeDocumentBySource,
  listEnabledChunkEmbeddingState,
  listEnabledKnowledgeDocuments,
  markKnowledgeDocumentIndexed,
  replaceDocumentChunks,
  setChunkEmbedding,
  upsertKnowledgeDocument,
  type ChunkInput
} from "@/lib/ai/database/repositories";
import { chunkDocument, estimateTokens } from "@/lib/ai/retrieval/chunking";
import { embedDocuments, VOYAGE_DIMENSIONS, VOYAGE_MODEL } from "@/lib/ai/embeddings/voyage";
import { buildLocalDocs, contentHash } from "./localContent";

/**
 * Server-side reindex: sync approved local content → documents, chunk enabled
 * documents, and embed chunks. Mirrors the ai:index / ai:chunk / ai:embed CLIs
 * (which stay the interactive/dry-run surface); this always writes and returns
 * structured stats for the admin action to persist on a job row.
 */

export type IndexStats = { created: number; updated: number; unchanged: number; total: number };
export type ChunkStats = { chunked: number; rechunked: number; unchanged: number; chunksWritten: number };
export type EmbedStats = { toEmbed: number; embedded: number; skipped: number; tokens: number };
export type ReindexResult = {
  index: IndexStats;
  chunk: ChunkStats;
  embed: EmbedStats | null;
  embedError: string | null;
};

type Log = (line: string) => void;

export async function syncKnowledgeDocuments(log?: Log): Promise<IndexStats> {
  const docs = await buildLocalDocs();
  const counts = { created: 0, updated: 0, unchanged: 0 };

  for (const doc of docs) {
    const hash = contentHash(doc);
    const existing = await getKnowledgeDocumentBySource(doc.sourceType, doc.sourceId);
    const state: "created" | "updated" | "unchanged" = !existing
      ? "created"
      : existing.contentHash === hash
        ? "unchanged"
        : "updated";
    counts[state] += 1;
    if (state === "unchanged") continue;

    log?.(`${state === "created" ? "+" : "~"} ${doc.sourceType}/${doc.sourceId}`);
    const saved = await upsertKnowledgeDocument({
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
    });
    await markKnowledgeDocumentIndexed(saved.id);
  }

  return { ...counts, total: docs.length };
}

function chunkContentHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function chunkKnowledge(log?: Log): Promise<ChunkStats> {
  const documents = await listEnabledKnowledgeDocuments(1000);
  const counts = { chunked: 0, rechunked: 0, unchanged: 0 };
  let chunksWritten = 0;

  for (const doc of documents) {
    const texts = chunkDocument({ sourceType: doc.sourceType, title: doc.title, body: doc.body });
    const chunks: ChunkInput[] = texts.map((chunkText, index) => ({
      chunkIndex: index,
      chunkText,
      tokenCount: estimateTokens(chunkText),
      contentHash: chunkContentHash(chunkText),
      metadata: { documentHash: doc.contentHash, sourceType: doc.sourceType }
    }));

    const existing = await getChunksByDocument(doc.id);
    const existingHash =
      existing.length > 0 ? (existing[0].metadata as { documentHash?: string }).documentHash : undefined;
    const upToDate = existing.length > 0 && existingHash === doc.contentHash;
    const state: "chunked" | "rechunked" | "unchanged" = upToDate
      ? "unchanged"
      : existing.length > 0
        ? "rechunked"
        : "chunked";
    counts[state] += 1;
    if (state === "unchanged") continue;

    chunksWritten += chunks.length;
    log?.(`${state === "chunked" ? "+" : "~"} ${doc.sourceType}/${doc.sourceId} — ${chunks.length} chunk(s)`);
    await replaceDocumentChunks(doc.id, chunks);
  }

  return { ...counts, chunksWritten };
}

export async function embedKnowledge(log?: Log): Promise<EmbedStats> {
  const chunks = await listEnabledChunkEmbeddingState(VOYAGE_MODEL, VOYAGE_DIMENSIONS);
  const toEmbed = chunks.filter((c) => !c.embedded);
  const skipped = chunks.length - toEmbed.length;
  if (toEmbed.length === 0) return { toEmbed: 0, embedded: 0, skipped, tokens: 0 };

  log?.(`Embedding ${toEmbed.length} chunk(s)…`);
  const { embeddings, totalTokens } = await embedDocuments(toEmbed.map((c) => c.chunkText));
  for (let i = 0; i < toEmbed.length; i += 1) {
    await setChunkEmbedding(toEmbed[i].id, embeddings[i], VOYAGE_MODEL, VOYAGE_DIMENSIONS);
  }
  return { toEmbed: toEmbed.length, embedded: toEmbed.length, skipped, tokens: totalTokens };
}

/**
 * Full reindex: index → chunk → embed. The embed step is isolated so a Voyage
 * outage yields a partial success (documents + chunks persisted, embeddings
 * recorded as an error) rather than a lost run.
 */
export async function runReindex(log?: Log): Promise<ReindexResult> {
  const index = await syncKnowledgeDocuments(log);
  const chunk = await chunkKnowledge(log);
  let embed: EmbedStats | null = null;
  let embedError: string | null = null;
  try {
    embed = await embedKnowledge(log);
  } catch (error) {
    embedError = error instanceof Error ? error.message : String(error);
  }
  return { index, chunk, embed, embedError };
}
