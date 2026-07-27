import { embedQuery } from "@/lib/ai/embeddings/voyage";
import { searchChunks } from "@/lib/ai/retrieval/keywordSearch";
import { vectorSearch, type VectorSearchResult } from "@/lib/ai/retrieval/vectorSearch";

/**
 * Hybrid retrieval: keyword full-text search fused with vector similarity via
 * Reciprocal Rank Fusion (RRF), plus a three-state relevance verdict so the
 * future chat API can distinguish "nothing relevant" (skip the model) from
 * "weak matches".
 *
 * This is the retrieval layer only — no chat API, no model answer generation.
 *
 * Resilience: if the embedding provider fails (e.g. Voyage outage), we degrade
 * to keyword-only search rather than failing the turn. The verdict is then
 * computed from keyword signals alone and the result is flagged `degraded`.
 */

/** RRF constant (Cormack et al.). Fuses by rank position, not raw score. */
export const RRF_K = 60;

/**
 * Cosine-similarity floors for the vector signal. A sequential scan always
 * returns its top-k, so a vector hit only "counts" once it clears a floor.
 * Keyword presence is treated as a strong signal on its own because
 * plainto_tsquery ANDs every term (all terms literally present in one chunk).
 *
 * Calibrated on voyage-4-lite / 512-dim against three probe queries on the
 * current corpus:
 *   - on-topic ("employment pass documents"): relevant chunks 0.49–0.60
 *   - paraphrased, keyword-miss ("how do I incorporate a company in singapore"):
 *     relevant chunks 0.58–0.70 (vector alone must carry these)
 *   - off-topic ("best pizza in town"): best 0.13, rest < 0.07
 * Relevant clusters at ~0.58–0.70, irrelevant at ≤0.13, so both floors sit in
 * that gap: STRONG below the relevant cluster (catches vector-only relevance),
 * WEAK well above the off-topic ceiling (real questions never fall to NONE).
 * Re-tune these as the corpus grows.
 */
export const VECTOR_FLOOR_STRONG = 0.5;
export const VECTOR_FLOOR_WEAK = 0.35;

export type MatchedBy = "keyword" | "vector" | "both";
export type Confidence = "strong" | "weak" | "none";

export type HybridResult = {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  sourceType: string;
  sourceId: string;
  title: string;
  href: string | null;
  summary: string | null;
  snippet: string;
  matchedBy: MatchedBy;
  keywordRank: number | null;
  vectorRank: number | null;
  keywordScore: number | null;
  cosineSimilarity: number | null;
  rrfScore: number;
};

export type HybridSearchOutput = {
  results: HybridResult[];
  confidence: Confidence;
  bestSimilarity: number | null;
  keywordHits: number;
  /** True when the embedding provider failed and this was keyword-only. */
  degraded: boolean;
};

/** RRF contribution for a 1-based rank position. */
function rrfContribution(rank: number): number {
  return 1 / (RRF_K + rank);
}

function truncateSnippet(text: string, maxChars = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > maxChars ? `${clean.slice(0, maxChars).trimEnd()}…` : clean;
}

function decideConfidence(keywordHits: number, bestSimilarity: number | null): Confidence {
  const hasKeyword = keywordHits > 0;
  const sim = bestSimilarity ?? 0;
  if (hasKeyword || sim >= VECTOR_FLOOR_STRONG) return "strong";
  if (sim >= VECTOR_FLOOR_WEAK) return "weak";
  return "none";
}

/**
 * Run keyword and vector search in parallel, fuse with RRF, and return the top
 * `limit` results with per-result provenance plus an overall confidence verdict.
 */
export async function hybridSearch(
  queryText: string,
  limit = 5
): Promise<HybridSearchOutput> {
  const trimmed = queryText.trim();
  if (!trimmed) {
    return { results: [], confidence: "none", bestSimilarity: null, keywordHits: 0, degraded: false };
  }

  // Pull a wider candidate pool from each retriever than we ultimately return,
  // so fusion has room to promote items that rank mid-list in one method.
  const pool = Math.max(limit * 4, 20);

  // Embed the query, but never let an embedding-provider outage kill the turn:
  // on failure we drop the vector arm and run keyword-only.
  let embedding: number[] | null = null;
  let degraded = false;
  try {
    embedding = (await embedQuery(trimmed)).embedding;
  } catch (error) {
    degraded = true;
    console.error("[hybridSearch] embedding failed; degrading to keyword-only", error);
  }

  const [keywordResults, vectorResults] = await Promise.all([
    searchChunks(trimmed, pool),
    embedding ? vectorSearch(embedding, pool) : Promise.resolve<VectorSearchResult[]>([])
  ]);

  const merged = new Map<string, HybridResult>();

  keywordResults.forEach((row, index) => {
    const rank = index + 1;
    merged.set(row.chunkId, {
      chunkId: row.chunkId,
      documentId: row.documentId,
      chunkIndex: row.chunkIndex,
      sourceType: row.sourceType,
      sourceId: row.sourceId,
      title: row.title,
      href: row.href,
      summary: row.summary,
      snippet: row.snippet,
      matchedBy: "keyword",
      keywordRank: rank,
      vectorRank: null,
      keywordScore: row.score,
      cosineSimilarity: null,
      rrfScore: rrfContribution(rank)
    });
  });

  vectorResults.forEach((row, index) => {
    const rank = index + 1;
    const existing = merged.get(row.chunkId);
    if (existing) {
      existing.matchedBy = "both";
      existing.vectorRank = rank;
      existing.cosineSimilarity = row.cosineSimilarity;
      existing.rrfScore += rrfContribution(rank);
    } else {
      merged.set(row.chunkId, {
        chunkId: row.chunkId,
        documentId: row.documentId,
        chunkIndex: row.chunkIndex,
        sourceType: row.sourceType,
        sourceId: row.sourceId,
        title: row.title,
        href: row.href,
        summary: row.summary,
        snippet: truncateSnippet(row.chunkText),
        matchedBy: "vector",
        keywordRank: null,
        vectorRank: rank,
        keywordScore: null,
        cosineSimilarity: row.cosineSimilarity,
        rrfScore: rrfContribution(rank)
      });
    }
  });

  const results = [...merged.values()]
    .sort(
      (a, b) =>
        b.rrfScore - a.rrfScore ||
        (b.cosineSimilarity ?? 0) - (a.cosineSimilarity ?? 0) ||
        (b.keywordScore ?? 0) - (a.keywordScore ?? 0)
    )
    .slice(0, limit);

  const bestSimilarity = vectorResults.length > 0 ? vectorResults[0].cosineSimilarity : null;
  const keywordHits = keywordResults.length;

  return {
    results,
    confidence: decideConfidence(keywordHits, bestSimilarity),
    bestSimilarity,
    keywordHits,
    degraded
  };
}
