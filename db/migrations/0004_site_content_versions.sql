-- Move admin-managed site content into Postgres, versioned. Each save inserts a
-- new row; the highest version is "current". The content/admin/site-content.json
-- file remains only as the seed/fallback source, not the runtime source of truth.

CREATE TABLE IF NOT EXISTS site_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version integer NOT NULL UNIQUE,
  content jsonb NOT NULL,
  note text,
  author text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_content_versions_version_idx
  ON site_content_versions (version DESC);

INSERT INTO atlas_schema_migrations (version)
VALUES ('0004_site_content_versions')
ON CONFLICT (version) DO NOTHING;
