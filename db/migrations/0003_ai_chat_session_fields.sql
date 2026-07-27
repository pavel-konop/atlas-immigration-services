-- Add a human-readable ref code and a metadata bag to chat sessions.
-- ref_code is shown to visitors for the future WhatsApp handoff; metadata holds
-- PDPA-minimal volunteered details (e.g. first name, country) the visitor offers.

ALTER TABLE ai_chat_sessions
  ADD COLUMN IF NOT EXISTS ref_code text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS ai_chat_sessions_ref_code_uidx
  ON ai_chat_sessions (ref_code)
  WHERE ref_code IS NOT NULL;

INSERT INTO atlas_schema_migrations (version)
VALUES ('0003_ai_chat_session_fields')
ON CONFLICT (version) DO NOTHING;
