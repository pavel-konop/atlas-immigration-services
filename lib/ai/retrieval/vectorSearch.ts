import { query } from "@/lib/ai/database/client";
import { VOYAGE_DIMENSIONS, VOYAGE_MODEL } from "@/lib/ai/embeddings/voyage";

/**
 * Vector (semantic) search over approved knowledge chunks using pgvector's
 * cosine distance operator `<=>`. Filtered to enabled documents and to chunks
 * embedded with the current model + dimensions — the same join/filter shape as
 * keyword `searchChunks`.
 *
 * No ANN index (HNSW/IVFFlat): at this corpus size a sequential scan is exact
 * and fast, and avoids approximate-recall surprises.
 */

export type VectorSearchResult = {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  chunkText: string;
  sourceType: string;
  sourceId: string;
  title: string;
  href: string | null;
  summary: string | null;
  cosineSimilarity: number;
};

type Row = {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  chunk_text: string;
  source_type: string;
  source_id: string;
  title: string;
  href: string | null;
  summary: string | null;
  cosine_similarity: number;
};

/**
 * Find the `limit` chunks most similar to `embedding` by cosine similarity.
 * The vector is passed as pgvector's `[v1,v2,...]` literal. Results are ordered
 * most-similar first; `cosineSimilarity` is `1 - cosine_distance`, in [-1, 1].
 */
export async function vectorSearch(
  embedding: number[],
  limit = 5
): Promise<VectorSearchResult[]> {
  if (embedding.length === 0) return [];

  const vectorLiteral = `[${embedding.join(",")}]`;

  const result = await query<Row>(
    `SELECT
       c.id AS chunk_id,
       c.document_id,
       c.chunk_index,
       c.chunk_text,
       d.source_type,
       d.source_id,
       d.title,
       d.href,
       d.summary,
       1 - (c.embedding <=> $1::vector) AS cosine_similarity
     FROM ai_knowledge_chunks c
     JOIN ai_knowledge_documents d ON d.id = c.document_id
     WHERE d.enabled = true
       AND c.embedding IS NOT NULL
       AND c.embedding_model = $2
       AND c.embedding_dimensions = $3
     ORDER BY c.embedding <=> $1::vector
     LIMIT $4`,
    [vectorLiteral, VOYAGE_MODEL, VOYAGE_DIMENSIONS, limit]
  );

  return result.rows.map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    chunkText: row.chunk_text,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    href: row.href,
    summary: row.summary,
    cosineSimilarity: Number(row.cosine_similarity)
  }));
}
