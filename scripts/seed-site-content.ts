/**
 * One-time seed: writes content/admin/site-content.json into Postgres as
 * version 1 of the versioned site-content store.
 *
 * SAFETY: this refuses to touch a store that already has ANY rows — not just a
 * fully-populated one. Re-running it against staging or production can never
 * clobber real edits; it exits cleanly and changes nothing.
 *
 * Usage:
 *   npm run content:seed
 */

import siteContentSeed from "@/content/admin/site-content.json";
import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { normalizeSiteContent } from "@/lib/admin/content";
import { countContentVersions, insertContentVersion } from "@/lib/admin/contentStore";
import type { SiteContent } from "@/types/admin-content";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set. Add it to .env before running content:seed.");
    process.exit(1);
  }

  const existing = await countContentVersions();
  if (existing > 0) {
    console.log(
      `site_content_versions already has ${existing} row(s) — leaving it untouched. Nothing seeded.`
    );
    return;
  }

  const normalized = normalizeSiteContent(siteContentSeed as Partial<SiteContent>);
  const result = await insertContentVersion({
    content: normalized,
    note: "Seeded from site-content.json",
    author: "seed"
  });

  if (result.ok) {
    console.log(`Seeded site content as version ${result.version}.`);
  } else {
    console.error("Seed failed — a concurrent write beat it. Re-check the table state.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
