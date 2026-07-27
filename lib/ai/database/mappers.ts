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
 * Row → record mappers. The database uses snake_case columns and returns
 * `timestamptz` as `Date` objects and `jsonb` as already-parsed values; the
 * record types in `./types` use camelCase with ISO-string timestamps. These
 * functions are the single place that translation happens.
 */

/** A raw row as returned by `pg` — column names are snake_case, values loosely typed. */
type Row = Record<string, unknown>;

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  // `pg` can also hand back strings for timestamps depending on parsers.
  return String(value);
}

function toIsoOrNull(value: unknown): string | null {
  return value == null ? null : toIso(value);
}

function toJsonObject(value: unknown): JsonObject {
  return (value ?? {}) as JsonObject;
}

function toJsonArray(value: unknown): JsonValue[] {
  return (value ?? []) as JsonValue[];
}

export function mapContentIntakeRow(row: Row): ContentIntakeRecord {
  return {
    id: row.id as string,
    sourceName: row.source_name as string,
    sourceType: row.source_type as string,
    rawContent: row.raw_content as string,
    rawMimeType: (row.raw_mime_type as string | null) ?? null,
    originalFilename: (row.original_filename as string | null) ?? null,
    sourceUrl: (row.source_url as string | null) ?? null,
    uploadedBy: (row.uploaded_by as string | null) ?? null,
    status: row.status as ContentIntakeStatus,
    metadata: toJsonObject(row.metadata),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export function mapKnowledgeDraftRow(row: Row): KnowledgeDraftRecord {
  return {
    id: row.id as string,
    intakeId: (row.intake_id as string | null) ?? null,
    processingJobId: (row.processing_job_id as string | null) ?? null,
    draftType: row.draft_type as KnowledgeDraftType,
    title: row.title as string,
    body: row.body as string,
    summary: (row.summary as string | null) ?? null,
    language: row.language as string,
    metadata: toJsonObject(row.metadata),
    structuredContent: toJsonObject(row.structured_content),
    riskFlags: toJsonArray(row.risk_flags),
    reviewStatus: row.review_status as ReviewStatus,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    reviewedAt: toIsoOrNull(row.reviewed_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export function mapKnowledgeDocumentRow(row: Row): KnowledgeDocumentRecord {
  return {
    id: row.id as string,
    draftId: (row.draft_id as string | null) ?? null,
    sourceType: row.source_type as string,
    sourceId: row.source_id as string,
    title: row.title as string,
    slug: (row.slug as string | null) ?? null,
    href: (row.href as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    body: row.body as string,
    language: row.language as string,
    metadata: toJsonObject(row.metadata),
    contentHash: row.content_hash as string,
    enabled: row.enabled as boolean,
    approvedBy: (row.approved_by as string | null) ?? null,
    approvedAt: toIsoOrNull(row.approved_at),
    lastIndexedAt: toIsoOrNull(row.last_indexed_at),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export function mapKnowledgeChunkRow(row: Row): KnowledgeChunkRecord {
  return {
    id: row.id as string,
    documentId: row.document_id as string,
    chunkIndex: row.chunk_index as number,
    chunkText: row.chunk_text as string,
    tokenCount: (row.token_count as number | null) ?? null,
    metadata: toJsonObject(row.metadata),
    embeddingModel: (row.embedding_model as string | null) ?? null,
    embeddingDimensions: (row.embedding_dimensions as number | null) ?? null,
    contentHash: row.content_hash as string,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

export function mapRetrievalMatchRow(row: Row): RetrievalMatchRecord {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    documentId: (row.document_id as string | null) ?? null,
    chunkId: (row.chunk_id as string | null) ?? null,
    retrievalMethod: row.retrieval_method as RetrievalMethod,
    rank: row.rank as number,
    score: (row.score as number | null) ?? null,
    snippet: (row.snippet as string | null) ?? null,
    metadata: toJsonObject(row.metadata),
    createdAt: toIso(row.created_at)
  };
}

export function mapChatSessionRow(row: Row): ChatSessionRecord {
  return {
    id: row.id as string,
    refCode: (row.ref_code as string | null) ?? null,
    visitorHash: (row.visitor_hash as string | null) ?? null,
    sourcePage: (row.source_page as string | null) ?? null,
    locale: (row.locale as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
    metadata: toJsonObject(row.metadata),
    createdAt: toIso(row.created_at),
    lastSeenAt: toIso(row.last_seen_at)
  };
}

export function mapChatMessageRow(row: Row): ChatMessageRecord {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    role: row.role as ChatMessageRole,
    content: row.content as string,
    createdAt: toIso(row.created_at)
  };
}

export function mapChatEventRow(row: Row): ChatEventRecord {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    userMessageId: (row.user_message_id as string | null) ?? null,
    assistantMessageId: (row.assistant_message_id as string | null) ?? null,
    question: row.question as string,
    normalizedQuestion: (row.normalized_question as string | null) ?? null,
    answerStatus: row.answer_status as ChatAnswerStatus,
    modelName: (row.model_name as string | null) ?? null,
    promptTokens: (row.prompt_tokens as number | null) ?? null,
    completionTokens: (row.completion_tokens as number | null) ?? null,
    latencyMs: (row.latency_ms as number | null) ?? null,
    matchedSources: toJsonArray(row.matched_sources),
    guardrailFlags: toJsonArray(row.guardrail_flags),
    createdAt: toIso(row.created_at)
  };
}
