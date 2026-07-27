import { query, withTransaction } from "./client";
import {
  mapChatEventRow,
  mapChatMessageRow,
  mapChatSessionRow,
  mapContentIntakeRow,
  mapKnowledgeChunkRow,
  mapKnowledgeDocumentRow,
  mapKnowledgeDraftRow,
  mapRetrievalMatchRow
} from "./mappers";
import type {
  ChatAnswerStatus,
  ChatEventRecord,
  ChatMessageRecord,
  ChatMessageRole,
  ChatSessionRecord,
  ContentIntakeRecord,
  ContentIntakeStatus,
  JsonObject,
  JsonValue,
  KnowledgeChunkRecord,
  KnowledgeDocumentRecord,
  KnowledgeDraftRecord,
  KnowledgeDraftType,
  RetrievalMatchRecord,
  RetrievalMethod,
  ReviewStatus
} from "./types";

/**
 * Typed data-access functions for the AI tables that have record types in
 * `./types`: content intake, knowledge drafts, knowledge documents, knowledge
 * chunks, and chat retrieval matches. Chat sessions/messages/events, feedback,
 * processing jobs, and reindex jobs are intentionally out of scope until they
 * have record types of their own.
 *
 * All queries are parameterized. Reads select explicit columns (never the
 * generated `search_vector`/`embedding` columns, which have no record fields).
 */

/* ------------------------------------------------------------------ intake */

const INTAKE_COLUMNS = `
  id, source_name, source_type, raw_content, raw_mime_type, original_filename,
  source_url, uploaded_by, status, metadata, created_at, updated_at
`;

export type InsertContentIntakeInput = {
  sourceName: string;
  sourceType: string;
  rawContent: string;
  rawMimeType?: string | null;
  originalFilename?: string | null;
  sourceUrl?: string | null;
  uploadedBy?: string | null;
  status?: ContentIntakeStatus;
  metadata?: JsonObject;
};

export async function insertContentIntake(
  input: InsertContentIntakeInput
): Promise<ContentIntakeRecord> {
  const result = await query(
    `INSERT INTO ai_content_intake
       (source_name, source_type, raw_content, raw_mime_type, original_filename,
        source_url, uploaded_by, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'queued'), COALESCE($9, '{}'::jsonb))
     RETURNING ${INTAKE_COLUMNS}`,
    [
      input.sourceName,
      input.sourceType,
      input.rawContent,
      input.rawMimeType ?? null,
      input.originalFilename ?? null,
      input.sourceUrl ?? null,
      input.uploadedBy ?? null,
      input.status ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null
    ]
  );
  return mapContentIntakeRow(result.rows[0]);
}

export async function getContentIntakeById(
  id: string
): Promise<ContentIntakeRecord | null> {
  const result = await query(
    `SELECT ${INTAKE_COLUMNS} FROM ai_content_intake WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapContentIntakeRow(result.rows[0]) : null;
}

export async function listContentIntakeByStatus(
  status: ContentIntakeStatus,
  limit = 50
): Promise<ContentIntakeRecord[]> {
  const result = await query(
    `SELECT ${INTAKE_COLUMNS} FROM ai_content_intake
     WHERE status = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [status, limit]
  );
  return result.rows.map(mapContentIntakeRow);
}

export async function updateContentIntakeStatus(
  id: string,
  status: ContentIntakeStatus
): Promise<ContentIntakeRecord | null> {
  const result = await query(
    `UPDATE ai_content_intake SET status = $2 WHERE id = $1
     RETURNING ${INTAKE_COLUMNS}`,
    [id, status]
  );
  return result.rows[0] ? mapContentIntakeRow(result.rows[0]) : null;
}

/* ------------------------------------------------------------------ drafts */

const DRAFT_COLUMNS = `
  id, intake_id, processing_job_id, draft_type, title, body, summary, language,
  metadata, structured_content, risk_flags, review_status, reviewed_by,
  reviewed_at, created_at, updated_at
`;

export type InsertKnowledgeDraftInput = {
  intakeId?: string | null;
  processingJobId?: string | null;
  draftType: KnowledgeDraftType;
  title: string;
  body: string;
  summary?: string | null;
  language?: string;
  metadata?: JsonObject;
  structuredContent?: JsonObject;
  riskFlags?: JsonValue[];
  reviewStatus?: ReviewStatus;
};

export async function insertKnowledgeDraft(
  input: InsertKnowledgeDraftInput
): Promise<KnowledgeDraftRecord> {
  const result = await query(
    `INSERT INTO ai_knowledge_drafts
       (intake_id, processing_job_id, draft_type, title, body, summary, language,
        metadata, structured_content, risk_flags, review_status)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'en'),
             COALESCE($8, '{}'::jsonb), COALESCE($9, '{}'::jsonb),
             COALESCE($10, '[]'::jsonb), COALESCE($11, 'pending'))
     RETURNING ${DRAFT_COLUMNS}`,
    [
      input.intakeId ?? null,
      input.processingJobId ?? null,
      input.draftType,
      input.title,
      input.body,
      input.summary ?? null,
      input.language ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.structuredContent ? JSON.stringify(input.structuredContent) : null,
      input.riskFlags ? JSON.stringify(input.riskFlags) : null,
      input.reviewStatus ?? null
    ]
  );
  return mapKnowledgeDraftRow(result.rows[0]);
}

export async function getKnowledgeDraftById(
  id: string
): Promise<KnowledgeDraftRecord | null> {
  const result = await query(
    `SELECT ${DRAFT_COLUMNS} FROM ai_knowledge_drafts WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapKnowledgeDraftRow(result.rows[0]) : null;
}

export async function listKnowledgeDraftsByReviewStatus(
  reviewStatus: ReviewStatus,
  limit = 50
): Promise<KnowledgeDraftRecord[]> {
  const result = await query(
    `SELECT ${DRAFT_COLUMNS} FROM ai_knowledge_drafts
     WHERE review_status = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [reviewStatus, limit]
  );
  return result.rows.map(mapKnowledgeDraftRow);
}

/* --------------------------------------------------------------- documents */

const DOCUMENT_COLUMNS = `
  id, draft_id, source_type, source_id, title, slug, href, summary, body,
  language, metadata, content_hash, enabled, approved_by, approved_at,
  last_indexed_at, created_at, updated_at
`;

export type UpsertKnowledgeDocumentInput = {
  draftId?: string | null;
  sourceType: string;
  sourceId: string;
  title: string;
  slug?: string | null;
  href?: string | null;
  summary?: string | null;
  body: string;
  language?: string;
  metadata?: JsonObject;
  contentHash: string;
  enabled?: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
};

/**
 * Insert or update a knowledge document, keyed by its unique
 * `(source_type, source_id)` pair. Used by the indexer to keep documents in
 * sync with their approved source content.
 */
export async function upsertKnowledgeDocument(
  input: UpsertKnowledgeDocumentInput
): Promise<KnowledgeDocumentRecord> {
  const result = await query(
    `INSERT INTO ai_knowledge_documents
       (draft_id, source_type, source_id, title, slug, href, summary, body,
        language, metadata, content_hash, enabled, approved_by, approved_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'en'),
             COALESCE($10, '{}'::jsonb), $11, COALESCE($12, false), $13, $14)
     ON CONFLICT (source_type, source_id) DO UPDATE SET
       draft_id = EXCLUDED.draft_id,
       title = EXCLUDED.title,
       slug = EXCLUDED.slug,
       href = EXCLUDED.href,
       summary = EXCLUDED.summary,
       body = EXCLUDED.body,
       language = EXCLUDED.language,
       metadata = EXCLUDED.metadata,
       content_hash = EXCLUDED.content_hash,
       enabled = EXCLUDED.enabled,
       approved_by = EXCLUDED.approved_by,
       approved_at = EXCLUDED.approved_at
     RETURNING ${DOCUMENT_COLUMNS}`,
    [
      input.draftId ?? null,
      input.sourceType,
      input.sourceId,
      input.title,
      input.slug ?? null,
      input.href ?? null,
      input.summary ?? null,
      input.body,
      input.language ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.contentHash,
      input.enabled ?? null,
      input.approvedBy ?? null,
      input.approvedAt ?? null
    ]
  );
  return mapKnowledgeDocumentRow(result.rows[0]);
}

export async function getKnowledgeDocumentById(
  id: string
): Promise<KnowledgeDocumentRecord | null> {
  const result = await query(
    `SELECT ${DOCUMENT_COLUMNS} FROM ai_knowledge_documents WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapKnowledgeDocumentRow(result.rows[0]) : null;
}

/** Look up a document by its unique `(source_type, source_id)` pair. */
export async function getKnowledgeDocumentBySource(
  sourceType: string,
  sourceId: string
): Promise<KnowledgeDocumentRecord | null> {
  const result = await query(
    `SELECT ${DOCUMENT_COLUMNS} FROM ai_knowledge_documents
     WHERE source_type = $1 AND source_id = $2`,
    [sourceType, sourceId]
  );
  return result.rows[0] ? mapKnowledgeDocumentRow(result.rows[0]) : null;
}

export async function listEnabledKnowledgeDocuments(
  limit = 100
): Promise<KnowledgeDocumentRecord[]> {
  const result = await query(
    `SELECT ${DOCUMENT_COLUMNS} FROM ai_knowledge_documents
     WHERE enabled = true
     ORDER BY updated_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map(mapKnowledgeDocumentRow);
}

export async function markKnowledgeDocumentIndexed(
  id: string
): Promise<void> {
  await query(
    `UPDATE ai_knowledge_documents SET last_indexed_at = now() WHERE id = $1`,
    [id]
  );
}

/* ------------------------------------------------------------------ chunks */

const CHUNK_COLUMNS = `
  id, document_id, chunk_index, chunk_text, token_count, metadata,
  embedding_model, embedding_dimensions, content_hash, created_at, updated_at
`;

export type ChunkInput = {
  chunkIndex: number;
  chunkText: string;
  tokenCount?: number | null;
  metadata?: JsonObject;
  embeddingModel?: string | null;
  embeddingDimensions?: number | null;
  contentHash: string;
};

export async function getChunksByDocument(
  documentId: string
): Promise<KnowledgeChunkRecord[]> {
  const result = await query(
    `SELECT ${CHUNK_COLUMNS} FROM ai_knowledge_chunks
     WHERE document_id = $1
     ORDER BY chunk_index`,
    [documentId]
  );
  return result.rows.map(mapKnowledgeChunkRow);
}

/**
 * Fetch chunks by id (e.g. the top retrieval hits) so callers can build answer
 * context from full chunk text. Result order is not guaranteed — callers that
 * need ranking should re-order by their own scores.
 */
export async function getChunksByIds(ids: string[]): Promise<KnowledgeChunkRecord[]> {
  if (ids.length === 0) return [];
  const result = await query(
    `SELECT ${CHUNK_COLUMNS} FROM ai_knowledge_chunks WHERE id = ANY($1::uuid[])`,
    [ids]
  );
  return result.rows.map(mapKnowledgeChunkRow);
}

/**
 * Replace all chunks for a document in a single transaction: delete the
 * existing chunks and insert the provided set. Embeddings are left null here —
 * the embedding step populates them separately.
 */
export async function replaceDocumentChunks(
  documentId: string,
  chunks: ChunkInput[]
): Promise<KnowledgeChunkRecord[]> {
  return withTransaction(async (client) => {
    await client.query(
      `DELETE FROM ai_knowledge_chunks WHERE document_id = $1`,
      [documentId]
    );

    const inserted: KnowledgeChunkRecord[] = [];
    for (const chunk of chunks) {
      const result = await client.query(
        `INSERT INTO ai_knowledge_chunks
           (document_id, chunk_index, chunk_text, token_count, metadata,
            embedding_model, embedding_dimensions, content_hash)
         VALUES ($1, $2, $3, $4, COALESCE($5, '{}'::jsonb), $6, $7, $8)
         RETURNING ${CHUNK_COLUMNS}`,
        [
          documentId,
          chunk.chunkIndex,
          chunk.chunkText,
          chunk.tokenCount ?? null,
          chunk.metadata ? JSON.stringify(chunk.metadata) : null,
          chunk.embeddingModel ?? null,
          chunk.embeddingDimensions ?? null,
          chunk.contentHash
        ]
      );
      inserted.push(mapKnowledgeChunkRow(result.rows[0]));
    }
    return inserted;
  });
}

/**
 * Embedding state for every chunk belonging to an enabled document.
 * `embedded` is true when the chunk already carries a vector for the given
 * model + dimensions, so the embedding worker can skip it (idempotent re-runs).
 */
export type ChunkEmbeddingState = {
  id: string;
  chunkText: string;
  embedded: boolean;
};

export async function listEnabledChunkEmbeddingState(
  embeddingModel: string,
  embeddingDimensions: number
): Promise<ChunkEmbeddingState[]> {
  const result = await query(
    `SELECT c.id, c.chunk_text,
       (c.embedding IS NOT NULL
         AND c.embedding_model = $1
         AND c.embedding_dimensions = $2) AS embedded
     FROM ai_knowledge_chunks c
     JOIN ai_knowledge_documents d ON d.id = c.document_id
     WHERE d.enabled = true
     ORDER BY c.document_id, c.chunk_index`,
    [embeddingModel, embeddingDimensions]
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    chunkText: row.chunk_text as string,
    embedded: row.embedded as boolean
  }));
}

/**
 * Store an embedding vector on a chunk, along with the model and dimensions
 * that produced it. The vector is passed as pgvector's `[v1,v2,...]` literal.
 */
export async function setChunkEmbedding(
  id: string,
  embedding: number[],
  embeddingModel: string,
  embeddingDimensions: number
): Promise<void> {
  await query(
    `UPDATE ai_knowledge_chunks
     SET embedding = $2::vector, embedding_model = $3, embedding_dimensions = $4
     WHERE id = $1`,
    [id, `[${embedding.join(",")}]`, embeddingModel, embeddingDimensions]
  );
}

/* -------------------------------------------------------- retrieval matches */

const RETRIEVAL_MATCH_COLUMNS = `
  id, event_id, document_id, chunk_id, retrieval_method, rank, score, snippet,
  metadata, created_at
`;

export type RetrievalMatchInput = {
  eventId: string;
  documentId?: string | null;
  chunkId?: string | null;
  retrievalMethod: RetrievalMethod;
  rank: number;
  score?: number | null;
  snippet?: string | null;
  metadata?: JsonObject;
};

export async function insertRetrievalMatches(
  matches: RetrievalMatchInput[]
): Promise<RetrievalMatchRecord[]> {
  if (matches.length === 0) return [];

  return withTransaction(async (client) => {
    const inserted: RetrievalMatchRecord[] = [];
    for (const match of matches) {
      const result = await client.query(
        `INSERT INTO ai_chat_retrieval_matches
           (event_id, document_id, chunk_id, retrieval_method, rank, score,
            snippet, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, '{}'::jsonb))
         RETURNING ${RETRIEVAL_MATCH_COLUMNS}`,
        [
          match.eventId,
          match.documentId ?? null,
          match.chunkId ?? null,
          match.retrievalMethod,
          match.rank,
          match.score ?? null,
          match.snippet ?? null,
          match.metadata ? JSON.stringify(match.metadata) : null
        ]
      );
      inserted.push(mapRetrievalMatchRow(result.rows[0]));
    }
    return inserted;
  });
}

/* ----------------------------------------------------------- chat sessions */

const CHAT_SESSION_COLUMNS = `
  id, ref_code, visitor_hash, source_page, locale, user_agent, metadata,
  created_at, last_seen_at
`;

export type CreateChatSessionInput = {
  refCode: string;
  visitorHash?: string | null;
  sourcePage?: string | null;
  locale?: string | null;
  userAgent?: string | null;
  metadata?: JsonObject;
};

export async function createChatSession(
  input: CreateChatSessionInput
): Promise<ChatSessionRecord> {
  const result = await query(
    `INSERT INTO ai_chat_sessions
       (ref_code, visitor_hash, source_page, locale, user_agent, metadata)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, '{}'::jsonb))
     RETURNING ${CHAT_SESSION_COLUMNS}`,
    [
      input.refCode,
      input.visitorHash ?? null,
      input.sourcePage ?? null,
      input.locale ?? null,
      input.userAgent ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null
    ]
  );
  return mapChatSessionRow(result.rows[0]);
}

export async function getChatSessionById(id: string): Promise<ChatSessionRecord | null> {
  const result = await query(
    `SELECT ${CHAT_SESSION_COLUMNS} FROM ai_chat_sessions WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapChatSessionRow(result.rows[0]) : null;
}

/** Bump last_seen_at to now (called on each turn). */
export async function touchChatSession(id: string): Promise<void> {
  await query(`UPDATE ai_chat_sessions SET last_seen_at = now() WHERE id = $1`, [id]);
}

/**
 * Shallow-merge additional keys into a session's metadata jsonb (e.g. a
 * volunteered first name or country). Existing keys are overwritten by `patch`.
 */
export async function mergeChatSessionMetadata(
  id: string,
  patch: JsonObject
): Promise<void> {
  await query(
    `UPDATE ai_chat_sessions SET metadata = metadata || $2::jsonb WHERE id = $1`,
    [id, JSON.stringify(patch)]
  );
}

/* ----------------------------------------------------------- chat messages */

const CHAT_MESSAGE_COLUMNS = `id, session_id, role, content, created_at`;

export async function insertChatMessage(
  sessionId: string,
  role: ChatMessageRole,
  content: string
): Promise<ChatMessageRecord> {
  const result = await query(
    `INSERT INTO ai_chat_messages (session_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING ${CHAT_MESSAGE_COLUMNS}`,
    [sessionId, role, content]
  );
  return mapChatMessageRow(result.rows[0]);
}

/** Most recent messages for a session, returned oldest-first for prompt building. */
export async function getRecentChatMessages(
  sessionId: string,
  limit = 8
): Promise<ChatMessageRecord[]> {
  const result = await query(
    `SELECT * FROM (
       SELECT ${CHAT_MESSAGE_COLUMNS} FROM ai_chat_messages
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT $2
     ) recent
     ORDER BY created_at ASC`,
    [sessionId, limit]
  );
  return result.rows.map(mapChatMessageRow);
}

/** Count how many user turns a session has had (drives the turn cap). */
export async function countUserChatMessages(sessionId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT count(*)::int AS count FROM ai_chat_messages
     WHERE session_id = $1 AND role = 'user'`,
    [sessionId]
  );
  return Number(result.rows[0]?.count ?? 0);
}

/* ------------------------------------------------------------- chat events */

const CHAT_EVENT_COLUMNS = `
  id, session_id, user_message_id, assistant_message_id, question,
  normalized_question, answer_status, model_name, prompt_tokens,
  completion_tokens, latency_ms, matched_sources, guardrail_flags, created_at
`;

export type InsertChatEventInput = {
  sessionId: string;
  userMessageId?: string | null;
  assistantMessageId?: string | null;
  question: string;
  normalizedQuestion?: string | null;
  answerStatus: ChatAnswerStatus;
  modelName?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  latencyMs?: number | null;
  matchedSources?: JsonValue[];
  guardrailFlags?: JsonValue[];
};

export async function insertChatEvent(
  input: InsertChatEventInput
): Promise<ChatEventRecord> {
  const result = await query(
    `INSERT INTO ai_chat_events
       (session_id, user_message_id, assistant_message_id, question,
        normalized_question, answer_status, model_name, prompt_tokens,
        completion_tokens, latency_ms, matched_sources, guardrail_flags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
             COALESCE($11, '[]'::jsonb), COALESCE($12, '[]'::jsonb))
     RETURNING ${CHAT_EVENT_COLUMNS}`,
    [
      input.sessionId,
      input.userMessageId ?? null,
      input.assistantMessageId ?? null,
      input.question,
      input.normalizedQuestion ?? null,
      input.answerStatus,
      input.modelName ?? null,
      input.promptTokens ?? null,
      input.completionTokens ?? null,
      input.latencyMs ?? null,
      input.matchedSources ? JSON.stringify(input.matchedSources) : null,
      input.guardrailFlags ? JSON.stringify(input.guardrailFlags) : null
    ]
  );
  return mapChatEventRow(result.rows[0]);
}
