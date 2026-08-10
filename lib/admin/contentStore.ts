import { query, withTransaction } from "@/lib/ai/database/client";
import type { SiteContent } from "@/types/admin-content";

/**
 * Postgres access for the versioned site-content store (`site_content_versions`).
 * Insert-only: each save is a new row, "current" is the highest version. This is
 * the persistence detail behind `lib/admin/content.ts`; callers should use that
 * module's interface rather than these functions directly.
 */

export type ContentVersionMeta = {
  version: number;
  createdAt: string;
  note: string | null;
  author: string | null;
};

export type InsertVersionResult =
  | { ok: true; version: number }
  | { ok: false; currentVersion: number };

function toIso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v);
}

export async function getCurrentContentRow(): Promise<{ version: number; content: SiteContent } | null> {
  const res = await query<{ version: number; content: SiteContent }>(
    `SELECT version, content FROM site_content_versions ORDER BY version DESC LIMIT 1`
  );
  const row = res.rows[0];
  return row ? { version: Number(row.version), content: row.content } : null;
}

export async function listContentVersions(limit = 50): Promise<ContentVersionMeta[]> {
  const res = await query(
    `SELECT version, created_at, note, author FROM site_content_versions ORDER BY version DESC LIMIT $1`,
    [limit]
  );
  return res.rows.map((r) => ({
    version: Number(r.version),
    createdAt: toIso(r.created_at),
    note: (r.note as string | null) ?? null,
    author: (r.author as string | null) ?? null
  }));
}

export async function getContentVersion(version: number): Promise<SiteContent | null> {
  const res = await query<{ content: SiteContent }>(
    `SELECT content FROM site_content_versions WHERE version = $1`,
    [version]
  );
  return res.rows[0] ? res.rows[0].content : null;
}

export async function countContentVersions(): Promise<number> {
  const res = await query<{ count: string }>(`SELECT count(*)::int AS count FROM site_content_versions`);
  return Number(res.rows[0]?.count ?? 0);
}

/**
 * Insert a new content version. If `baseVersion` is provided the insert is
 * concurrency-checked and fails (returns the current version) when the store has
 * moved past `baseVersion`. Omit it for an unconditional last-write-wins insert.
 * The UNIQUE(version) constraint makes a genuine concurrent tie race-safe: the
 * loser's insert violates the constraint and is reported as a conflict.
 */
export async function insertContentVersion(input: {
  content: SiteContent;
  baseVersion?: number;
  note?: string | null;
  author?: string | null;
}): Promise<InsertVersionResult> {
  try {
    return await withTransaction(async (client) => {
      const currentRes = await client.query<{ max: number | null }>(
        `SELECT MAX(version) AS max FROM site_content_versions`
      );
      const currentVersion = Number(currentRes.rows[0]?.max ?? 0);

      if (input.baseVersion !== undefined && input.baseVersion !== currentVersion) {
        return { ok: false, currentVersion };
      }

      const nextVersion = currentVersion + 1;
      await client.query(
        `INSERT INTO site_content_versions (version, content, note, author)
         VALUES ($1, $2::jsonb, $3, $4)`,
        [nextVersion, JSON.stringify(input.content), input.note ?? null, input.author ?? null]
      );
      return { ok: true, version: nextVersion };
    });
  } catch (error) {
    // A concurrent insert took the same version number.
    if ((error as { code?: string }).code === "23505") {
      const current = await getCurrentContentRow();
      return { ok: false, currentVersion: current?.version ?? 0 };
    }
    throw error;
  }
}
