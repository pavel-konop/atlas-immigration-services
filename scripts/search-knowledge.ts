/**
 * Search CLI — a small, testable surface over the retrieval layer.
 * Not the chat API (that's roadmap item 5).
 *
 * Usage:
 *   npm run ai:search -- "employment pass documents"        # keyword only (default)
 *   npm run ai:search -- --limit=10 "company incorporation"
 *   npm run ai:search:hybrid -- "how do I incorporate a company"  # keyword + vector (RRF)
 */

import { isDatabaseConfigured } from "@/lib/ai/database/client";
import { searchChunks } from "@/lib/ai/retrieval/keywordSearch";
import { hybridSearch } from "@/lib/ai/retrieval/hybridSearch";

async function runKeyword(queryText: string, limit: number) {
  const results = await searchChunks(queryText, limit);
  console.log(`Query: "${queryText}" — keyword — ${results.length} result(s)\n`);
  results.forEach((r, i) => {
    console.log(`${i + 1}. [${r.sourceType}/${r.sourceId}] ${r.title}  (score ${r.score.toFixed(4)})`);
    if (r.href) console.log(`   ${r.href}  chunk #${r.chunkIndex}`);
    console.log(`   ${r.snippet.replace(/\s+/g, " ").trim()}\n`);
  });
}

async function runHybrid(queryText: string, limit: number) {
  const { results, confidence, bestSimilarity, keywordHits, degraded } = await hybridSearch(queryText, limit);
  const best = bestSimilarity == null ? "n/a" : bestSimilarity.toFixed(4);
  console.log(
    `Query: "${queryText}" — hybrid${degraded ? " (DEGRADED: keyword-only)" : ""} — ${results.length} result(s)\n` +
      `Confidence: ${confidence.toUpperCase()}  (keywordHits ${keywordHits}, bestSimilarity ${best})\n`
  );
  results.forEach((r, i) => {
    const sim = r.cosineSimilarity == null ? "—" : r.cosineSimilarity.toFixed(4);
    const kw = r.keywordScore == null ? "—" : r.keywordScore.toFixed(4);
    console.log(
      `${i + 1}. [${r.sourceType}/${r.sourceId}] ${r.title}  ` +
        `(${r.matchedBy}; rrf ${r.rrfScore.toFixed(5)}, cos ${sim}, kw ${kw})`
    );
    if (r.href) console.log(`   ${r.href}  chunk #${r.chunkIndex}`);
    console.log(`   ${r.snippet.replace(/\s+/g, " ").trim()}\n`);
  });
}

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set. Add it to .env or export it before running ai:search.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const hybrid = args.includes("--hybrid");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.replace("--limit=", "")) : 5;
  const queryText = args.filter((a) => !a.startsWith("--")).join(" ").trim();

  if (!queryText) {
    console.error('Provide a search query, e.g. npm run ai:search -- "employment pass"');
    process.exit(1);
  }

  if (hybrid) {
    await runHybrid(queryText, limit);
  } else {
    await runKeyword(queryText, limit);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
