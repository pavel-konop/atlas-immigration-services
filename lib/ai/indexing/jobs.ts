import { query } from "@/lib/ai/database/client";
import type { JsonObject, ReindexJobStatus, ReindexJobType } from "@/lib/ai/database/types";

/** Read/write helpers for `ai_reindex_jobs` — the durable record of reindex runs. */

export type ReindexJobRecord = {
  id: string;
  jobType: ReindexJobType;
  status: ReindexJobStatus;
  documentsSeen: number;
  documentsChanged: number;
  chunksChanged: number;
  embeddingsChanged: number;
  error: string | null;
  metadata: JsonObject;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

const COLUMNS = `
  id, job_type, status, documents_seen, documents_changed, chunks_changed,
  embeddings_changed, error, metadata, started_at, finished_at, created_at
`;

function toIso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v);
}

function mapRow(row: Record<string, unknown>): ReindexJobRecord {
  return {
    id: row.id as string,
    jobType: row.job_type as ReindexJobType,
    status: row.status as ReindexJobStatus,
    documentsSeen: Number(row.documents_seen ?? 0),
    documentsChanged: Number(row.documents_changed ?? 0),
    chunksChanged: Number(row.chunks_changed ?? 0),
    embeddingsChanged: Number(row.embeddings_changed ?? 0),
    error: (row.error as string | null) ?? null,
    metadata: (row.metadata ?? {}) as JsonObject,
    startedAt: row.started_at == null ? null : toIso(row.started_at),
    finishedAt: row.finished_at == null ? null : toIso(row.finished_at),
    createdAt: toIso(row.created_at)
  };
}

/** Start a running full-reindex job. */
export async function startReindexJob(): Promise<ReindexJobRecord> {
  const result = await query(
    `INSERT INTO ai_reindex_jobs (job_type, status, started_at)
     VALUES ('full_reindex', 'running', now())
     RETURNING ${COLUMNS}`
  );
  return mapRow(result.rows[0]);
}

export type FinishReindexInput = {
  status: Extract<ReindexJobStatus, "completed" | "failed">;
  documentsSeen: number;
  documentsChanged: number;
  chunksChanged: number;
  embeddingsChanged: number;
  error?: string | null;
  metadata?: JsonObject;
};

export async function finishReindexJob(id: string, input: FinishReindexInput): Promise<ReindexJobRecord> {
  const result = await query(
    `UPDATE ai_reindex_jobs SET
       status = $2, documents_seen = $3, documents_changed = $4,
       chunks_changed = $5, embeddings_changed = $6, error = $7,
       metadata = COALESCE($8, '{}'::jsonb), finished_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [
      id,
      input.status,
      input.documentsSeen,
      input.documentsChanged,
      input.chunksChanged,
      input.embeddingsChanged,
      input.error ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null
    ]
  );
  return mapRow(result.rows[0]);
}

export async function getLatestReindexJob(): Promise<ReindexJobRecord | null> {
  const result = await query(
    `SELECT ${COLUMNS} FROM ai_reindex_jobs ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

/**
 * A reindex job that is still `running` and was started recently. Used to block
 * concurrent runs; a job stuck `running` for longer than the window is treated
 * as dead (the process died) and ignored.
 */
export async function getActiveReindexJob(withinMinutes = 10): Promise<ReindexJobRecord | null> {
  const result = await query(
    `SELECT ${COLUMNS} FROM ai_reindex_jobs
     WHERE status = 'running' AND started_at > now() - ($1 || ' minutes')::interval
     ORDER BY created_at DESC LIMIT 1`,
    [String(withinMinutes)]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}
