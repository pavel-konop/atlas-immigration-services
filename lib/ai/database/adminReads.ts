import { query } from "./client";
import { mapChatEventRow, mapChatMessageRow, mapChatSessionRow } from "./mappers";
import type { ChatEventRecord, ChatMessageRecord, ChatSessionRecord } from "./types";

/**
 * Read-only queries backing the admin Chats and Knowledge pages. Called from
 * server components inside the auth-gated admin layout.
 */

export type SessionSummary = {
  id: string;
  refCode: string | null;
  createdAt: string;
  lastSeenAt: string;
  name: string | null;
  country: string | null;
  messageCount: number;
  answered: number;
  weak: number;
  none: number;
  other: number;
  ctaShown: number;
  ctaClicked: boolean;
};

function toIso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v);
}

/** Sessions newest-first, with aggregates but no message content. Optional ref-code search. */
export async function listSessionSummaries(search?: string, limit = 100): Promise<SessionSummary[]> {
  const term = search?.trim();
  const result = await query(
    `SELECT
       s.id, s.ref_code, s.created_at, s.last_seen_at,
       s.metadata->>'name' AS name,
       s.metadata->>'country' AS country,
       (s.metadata->>'ctaClicked' = 'true') AS cta_clicked,
       (SELECT count(*) FROM ai_chat_messages m WHERE m.session_id = s.id) AS message_count,
       (SELECT count(*) FROM ai_chat_events e WHERE e.session_id = s.id AND e.answer_status = 'answered') AS answered,
       (SELECT count(*) FROM ai_chat_events e WHERE e.session_id = s.id AND e.answer_status = 'escalated') AS weak,
       (SELECT count(*) FROM ai_chat_events e WHERE e.session_id = s.id AND e.answer_status = 'not_found') AS none,
       (SELECT count(*) FROM ai_chat_events e WHERE e.session_id = s.id AND e.answer_status IN ('error', 'blocked', 'clarify')) AS other,
       (SELECT count(*) FROM ai_chat_events e WHERE e.session_id = s.id AND e.guardrail_flags @> '["cta_shown"]') AS cta_shown
     FROM ai_chat_sessions s
     ${term ? "WHERE s.ref_code ILIKE $2" : ""}
     ORDER BY s.last_seen_at DESC
     LIMIT $1`,
    term ? [limit, `%${term}%`] : [limit]
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    refCode: (row.ref_code as string | null) ?? null,
    createdAt: toIso(row.created_at),
    lastSeenAt: toIso(row.last_seen_at),
    name: (row.name as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    messageCount: Number(row.message_count ?? 0),
    answered: Number(row.answered ?? 0),
    weak: Number(row.weak ?? 0),
    none: Number(row.none ?? 0),
    other: Number(row.other ?? 0),
    ctaShown: Number(row.cta_shown ?? 0),
    ctaClicked: Boolean(row.cta_clicked)
  }));
}

export type Transcript = {
  session: ChatSessionRecord;
  messages: ChatMessageRecord[];
  events: ChatEventRecord[];
};

const CHAT_MESSAGE_COLUMNS = `id, session_id, role, content, created_at`;
const CHAT_SESSION_COLUMNS = `
  id, ref_code, visitor_hash, source_page, locale, user_agent, metadata,
  created_at, last_seen_at
`;
const CHAT_EVENT_COLUMNS = `
  id, session_id, user_message_id, assistant_message_id, question,
  normalized_question, answer_status, model_name, prompt_tokens,
  completion_tokens, latency_ms, matched_sources, guardrail_flags, created_at
`;

/** Full read-only transcript: session, ordered messages, and per-answer events. */
export async function getSessionTranscript(sessionId: string): Promise<Transcript | null> {
  const sessionRes = await query(
    `SELECT ${CHAT_SESSION_COLUMNS} FROM ai_chat_sessions WHERE id = $1`,
    [sessionId]
  );
  if (!sessionRes.rows[0]) return null;

  const [messagesRes, eventsRes] = await Promise.all([
    query(`SELECT ${CHAT_MESSAGE_COLUMNS} FROM ai_chat_messages WHERE session_id = $1 ORDER BY created_at ASC`, [sessionId]),
    query(`SELECT ${CHAT_EVENT_COLUMNS} FROM ai_chat_events WHERE session_id = $1 ORDER BY created_at ASC`, [sessionId])
  ]);

  return {
    session: mapChatSessionRow(sessionRes.rows[0]),
    messages: messagesRes.rows.map(mapChatMessageRow),
    events: eventsRes.rows.map(mapChatEventRow)
  };
}

export type FunnelStats = {
  sessions: number;
  reachedCta: number;
  clickedCta: number;
  hitFallback: number;
};

/** Funnel numbers for sessions created in the last `days` days. */
export async function getFunnelStats(days = 7): Promise<FunnelStats> {
  const result = await query<{
    sessions: string;
    reached_cta: string;
    clicked_cta: string;
    hit_fallback: string;
  }>(
    `WITH recent AS (
       SELECT id, metadata FROM ai_chat_sessions WHERE created_at > now() - ($1 || ' days')::interval
     )
     SELECT
       (SELECT count(*) FROM recent) AS sessions,
       (SELECT count(DISTINCT e.session_id) FROM ai_chat_events e
          JOIN recent r ON r.id = e.session_id WHERE e.guardrail_flags @> '["cta_shown"]') AS reached_cta,
       (SELECT count(*) FROM recent WHERE metadata->>'ctaClicked' = 'true') AS clicked_cta,
       (SELECT count(DISTINCT e.session_id) FROM ai_chat_events e
          JOIN recent r ON r.id = e.session_id
          WHERE e.answer_status = 'not_found' OR e.guardrail_flags @> '["fallback_served"]') AS hit_fallback`,
    [String(days)]
  );
  const row = result.rows[0];
  return {
    sessions: Number(row?.sessions ?? 0),
    reachedCta: Number(row?.reached_cta ?? 0),
    clickedCta: Number(row?.clicked_cta ?? 0),
    hitFallback: Number(row?.hit_fallback ?? 0)
  };
}

export type KnowledgeCounts = {
  documents: number;
  enabledDocuments: number;
  chunks: number;
  embeddedChunks: number;
};

export async function getKnowledgeCounts(): Promise<KnowledgeCounts> {
  const result = await query<{
    documents: string;
    enabled_documents: string;
    chunks: string;
    embedded_chunks: string;
  }>(
    `SELECT
       (SELECT count(*) FROM ai_knowledge_documents) AS documents,
       (SELECT count(*) FROM ai_knowledge_documents WHERE enabled) AS enabled_documents,
       (SELECT count(*) FROM ai_knowledge_chunks) AS chunks,
       (SELECT count(*) FROM ai_knowledge_chunks WHERE embedding IS NOT NULL) AS embedded_chunks`
  );
  const row = result.rows[0];
  return {
    documents: Number(row?.documents ?? 0),
    enabledDocuments: Number(row?.enabled_documents ?? 0),
    chunks: Number(row?.chunks ?? 0),
    embeddedChunks: Number(row?.embedded_chunks ?? 0)
  };
}
