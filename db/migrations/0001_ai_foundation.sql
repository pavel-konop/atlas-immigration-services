-- Atlas AI foundation schema.
-- Requires Postgres with pgvector available.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS atlas_schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS ai_content_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text NOT NULL,
  raw_content text NOT NULL,
  raw_mime_type text,
  original_filename text,
  source_url text,
  uploaded_by text,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'processed', 'failed', 'archived')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_content_intake_status_idx
  ON ai_content_intake (status, created_at DESC);

DROP TRIGGER IF EXISTS ai_content_intake_set_updated_at ON ai_content_intake;

CREATE TRIGGER ai_content_intake_set_updated_at
BEFORE UPDATE ON ai_content_intake
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ai_content_processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid NOT NULL REFERENCES ai_content_intake(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  model_name text,
  prompt_version text,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_content_processing_jobs_intake_idx
  ON ai_content_processing_jobs (intake_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_knowledge_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid REFERENCES ai_content_intake(id) ON DELETE SET NULL,
  processing_job_id uuid REFERENCES ai_content_processing_jobs(id) ON DELETE SET NULL,
  draft_type text NOT NULL
    CHECK (draft_type IN ('service', 'faq', 'article', 'checklist', 'process_note', 'guardrail', 'general_knowledge')),
  title text NOT NULL,
  body text NOT NULL,
  summary text,
  language text NOT NULL DEFAULT 'en',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  structured_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'needs_changes', 'rejected', 'archived')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_knowledge_drafts_review_status_idx
  ON ai_knowledge_drafts (review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_knowledge_drafts_intake_idx
  ON ai_knowledge_drafts (intake_id, created_at DESC);

DROP TRIGGER IF EXISTS ai_knowledge_drafts_set_updated_at ON ai_knowledge_drafts;

CREATE TRIGGER ai_knowledge_drafts_set_updated_at
BEFORE UPDATE ON ai_knowledge_drafts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid REFERENCES ai_knowledge_drafts(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_id text NOT NULL,
  title text NOT NULL,
  slug text,
  href text,
  summary text,
  body text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  last_indexed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);

CREATE INDEX IF NOT EXISTS ai_knowledge_documents_enabled_idx
  ON ai_knowledge_documents (enabled, updated_at DESC);

CREATE INDEX IF NOT EXISTS ai_knowledge_documents_source_idx
  ON ai_knowledge_documents (source_type, source_id);

CREATE INDEX IF NOT EXISTS ai_knowledge_documents_metadata_gin_idx
  ON ai_knowledge_documents USING gin (metadata);

DROP TRIGGER IF EXISTS ai_knowledge_documents_set_updated_at ON ai_knowledge_documents;

CREATE TRIGGER ai_knowledge_documents_set_updated_at
BEFORE UPDATE ON ai_knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ai_knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES ai_knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  chunk_text text NOT NULL,
  token_count integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(chunk_text, ''))) STORED,
  embedding vector,
  embedding_model text,
  embedding_dimensions integer,
  content_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS ai_knowledge_chunks_document_idx
  ON ai_knowledge_chunks (document_id, chunk_index);

CREATE INDEX IF NOT EXISTS ai_knowledge_chunks_search_vector_idx
  ON ai_knowledge_chunks USING gin (search_vector);

CREATE INDEX IF NOT EXISTS ai_knowledge_chunks_embedding_model_idx
  ON ai_knowledge_chunks (embedding_model, embedding_dimensions)
  WHERE embedding IS NOT NULL;

DROP TRIGGER IF EXISTS ai_knowledge_chunks_set_updated_at ON ai_knowledge_chunks;

CREATE TRIGGER ai_knowledge_chunks_set_updated_at
BEFORE UPDATE ON ai_knowledge_chunks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_hash text,
  source_page text,
  locale text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_sessions_visitor_idx
  ON ai_chat_sessions (visitor_hash, last_seen_at DESC);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_messages_session_idx
  ON ai_chat_messages (session_id, created_at);

CREATE TABLE IF NOT EXISTS ai_chat_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  user_message_id uuid REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
  assistant_message_id uuid REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
  question text NOT NULL,
  normalized_question text,
  answer_status text NOT NULL
    CHECK (answer_status IN ('answered', 'clarify', 'not_found', 'escalated', 'blocked', 'error')),
  model_name text,
  prompt_tokens integer,
  completion_tokens integer,
  latency_ms integer,
  matched_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  guardrail_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_events_session_idx
  ON ai_chat_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_chat_events_status_idx
  ON ai_chat_events (answer_status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_chat_retrieval_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES ai_chat_events(id) ON DELETE CASCADE,
  document_id uuid REFERENCES ai_knowledge_documents(id) ON DELETE SET NULL,
  chunk_id uuid REFERENCES ai_knowledge_chunks(id) ON DELETE SET NULL,
  retrieval_method text NOT NULL CHECK (retrieval_method IN ('keyword', 'vector', 'hybrid', 'manual')),
  rank integer NOT NULL,
  score double precision,
  snippet text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_retrieval_matches_event_idx
  ON ai_chat_retrieval_matches (event_id, rank);

CREATE INDEX IF NOT EXISTS ai_chat_retrieval_matches_chunk_idx
  ON ai_chat_retrieval_matches (chunk_id);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES ai_chat_events(id) ON DELETE CASCADE,
  rating text CHECK (rating IN ('positive', 'negative', 'neutral')),
  comment text,
  review_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN ('unreviewed', 'reviewed', 'converted_to_content', 'ignored')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_feedback_review_status_idx
  ON ai_feedback (review_status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_reindex_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL
    CHECK (job_type IN ('content_sync', 'chunking', 'embedding', 'full_reindex', 'report', 'optimization')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  documents_seen integer NOT NULL DEFAULT 0,
  documents_changed integer NOT NULL DEFAULT 0,
  chunks_changed integer NOT NULL DEFAULT 0,
  embeddings_changed integer NOT NULL DEFAULT 0,
  error text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_reindex_jobs_status_idx
  ON ai_reindex_jobs (status, created_at DESC);

INSERT INTO atlas_schema_migrations (version)
VALUES ('0001_ai_foundation')
ON CONFLICT (version) DO NOTHING;
