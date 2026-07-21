import { query } from "@/lib/ai/database/client";

/**
 * Keyword search over approved knowledge chunks using Postgres full-text
 * search. Ranking uses the generated `search_vector` column
 * (`to_tsvector('simple', chunk_text)`), so queries must use the matching
 * `plainto_tsquery('simple', ...)` config — a different config silently fails
 * to match.
 *
 * This is the small retrieval primitive for item 3. Vector/hybrid search
 * (item 4) and the chat API (item 5) build on top of it later.
 */

export type KeywordSearchResult = {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  sourceType: string;
  sourceId: string;
  title: string;
  href: string | null;
  summary: string | null;
  snippet: string;
  score: number;
};

type Row = {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  source_type: string;
  source_id: string;
  title: string;
  href: string | null;
  summary: string | null;
  snippet: string;
  score: number;
};

/**
 * Search enabled knowledge documents' chunks for `text`, ranked by full-text
 * relevance. Only chunks belonging to `enabled = true` documents are returned,
 * so chunks left behind by a since-disabled document never surface.
 */
export async function searchChunks(
  text: string,
  limit = 5
): Promise<KeywordSearchResult[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const result = await query<Row>(
    `SELECT
       c.id AS chunk_id,
       c.document_id,
       c.chunk_index,
       d.source_type,
       d.source_id,
       d.title,
       d.href,
       d.summary,
       ts_headline('simple', c.chunk_text, plainto_tsquery('simple', $1),
                   'MaxFragments=1, MaxWords=25, MinWords=10') AS snippet,
       ts_rank(c.search_vector, plainto_tsquery('simple', $1)) AS score
     FROM ai_knowledge_chunks c
     JOIN ai_knowledge_documents d ON d.id = c.document_id
     WHERE d.enabled = true
       AND c.search_vector @@ plainto_tsquery('simple', $1)
     ORDER BY score DESC, c.document_id, c.chunk_index
     LIMIT $2`,
    [trimmed, limit]
  );

  return result.rows.map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    href: row.href,
    summary: row.summary,
    snippet: row.snippet,
    score: Number(row.score)
  }));
}
