-- Make external source intake idempotent.

CREATE UNIQUE INDEX IF NOT EXISTS ai_content_intake_source_type_url_uidx
  ON ai_content_intake (source_type, source_url)
  WHERE source_url IS NOT NULL;

INSERT INTO atlas_schema_migrations (version)
VALUES ('0002_ai_content_intake_source_url_unique')
ON CONFLICT (version) DO NOTHING;
