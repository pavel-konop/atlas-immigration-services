/**
 * Embedding worker — generates Voyage AI embeddings for enabled knowledge
 * chunks and stores them on `ai_knowledge_chunks` (roadmap item 4).
 *
 * Does NOT touch chunking (ai:chunk), indexing (ai:index), migrations, or the
 * MOM importer. No schema change: the `embedding` column is an unconstrained
 * `vector`, so 512-dim vectors are stored directly.
 *
 * Idempotent (same pattern as ai:chunk): a chunk that already carries a
 * voyage-4-lite / 512-dim vector is skipped. After ai:chunk replaces a
 * document's chunks (embedding reset to null), the next run re-embeds them.
 *
 * Usage:
 *   npm run ai:embed:dry-run    # report count + token/cost estimate, no API call
 *   npm run ai:embed            # generate and store embeddings
 *   npm run ai:embed -- --force # re-embed every enabled chunk
 */

import { isDatabaseConfigured } from "@/lib/ai/database/client";
import {
  listEnabledChunkEmbeddingState,
  setChunkEmbedding
} from "@/lib/ai/database/repositories";
import {
  embedDocuments,
  VOYAGE_DIMENSIONS,
  VOYAGE_MODEL
} from "@/lib/ai/embeddings/voyage";

const flags = new Set(process.argv.slice(2));
const dryRun = flags.has("--dry-run");
const force = flags.has("--force");

/** Rough token estimate (~4 chars/token); Voyage returns the exact count on a real run. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Approx cost at Voyage lite-tier pricing (~$0.02 per 1M tokens). */
function estimateCostUsd(tokens: number): number {
  return (tokens / 1_000_000) * 0.02;
}

async function main() {
  if (!isDatabaseConfigured()) {
    console.error(
      "DATABASE_URL is not set. Add it to .env or export it before running ai:embed."
    );
    process.exit(1);
  }

  const chunks = await listEnabledChunkEmbeddingState(VOYAGE_MODEL, VOYAGE_DIMENSIONS);
  const toEmbed = force ? chunks : chunks.filter((c) => !c.embedded);
  const skipped = chunks.length - toEmbed.length;

  const estTokens = toEmbed.reduce((sum, c) => sum + estimateTokens(c.chunkText), 0);
  console.log(
    `${dryRun ? "[dry-run] " : ""}${chunks.length} enabled chunk(s): ` +
      `${toEmbed.length} to embed, ${skipped} already embedded${force ? " (force)" : ""}.`
  );
  console.log(
    `  Model ${VOYAGE_MODEL}, ${VOYAGE_DIMENSIONS} dims. ` +
      `Estimated ~${estTokens} tokens ≈ $${estimateCostUsd(estTokens).toFixed(6)}.`
  );

  if (toEmbed.length === 0) {
    console.log(`${dryRun ? "[dry-run] " : ""}Nothing to embed.`);
    return;
  }

  if (dryRun) {
    console.log("[dry-run] No API call made, no vectors written.");
    return;
  }

  if (!process.env.VOYAGE_API_KEY) {
    console.error("VOYAGE_API_KEY is not set. Add it to .env or export it before running ai:embed.");
    process.exit(1);
  }

  const { embeddings, totalTokens } = await embedDocuments(toEmbed.map((c) => c.chunkText));

  for (let i = 0; i < toEmbed.length; i += 1) {
    await setChunkEmbedding(toEmbed[i].id, embeddings[i], VOYAGE_MODEL, VOYAGE_DIMENSIONS);
  }

  const cost = estimateCostUsd(totalTokens);
  console.log(
    `Done — embedded ${toEmbed.length} chunk(s), ${skipped} skipped. ` +
      `Voyage reported ${totalTokens} tokens ≈ $${cost.toFixed(6)}.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
