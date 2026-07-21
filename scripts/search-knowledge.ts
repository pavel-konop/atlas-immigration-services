/**
 * Keyword search CLI — a small, testable surface over `searchChunks`.
 * Not the chat API (that's roadmap item 5).
 *
 * Usage:
 *   npm run ai:search -- "employment pass documents"
 *   npm run ai:search -- --limit=10 "company incorporation"
 */

import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { searchChunks } from "@/lib/ai/retrieval/keywordSearch";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set. Add it to .env or export it before running ai:search.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : 5;
  const queryText = args.filter((a) => !a.startsWith("--")).join(" ").trim();

  if (!queryText) {
    console.error('Provide a search query, e.g. npm run ai:search -- "employment pass"');
    process.exit(1);
  }

  const results = await searchChunks(queryText, limit);
  console.log(`Query: "${queryText}" — ${results.length} result(s)\n`);

  results.forEach((r, i) => {
    console.log(`${i + 1}. [${r.sourceType}/${r.sourceId}] ${r.title}  (score ${r.score.toFixed(4)})`);
    if (r.href) console.log(`   ${r.href}  chunk #${r.chunkIndex}`);
    console.log(`   ${r.snippet.replace(/\s+/g, " ").trim()}\n`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
