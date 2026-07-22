/**
 * Voyage AI embedding provider.
 *
 * Generates document embeddings for approved knowledge chunks (roadmap item 4).
 * Requests reduced 512-dimensional output and batches many texts into a single
 * API call. The API key is read from `VOYAGE_API_KEY` at call time.
 */

export const VOYAGE_MODEL = "voyage-4-lite";
export const VOYAGE_DIMENSIONS = 512;
/** Max inputs per request. Keeps a single call for small corpora, splits if it grows. */
export const MAX_BATCH = 128;

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

export type EmbedResult = {
  embeddings: number[][];
  model: string;
  dimensions: number;
  totalTokens: number;
};

type VoyageResponse = {
  data: { embedding: number[]; index: number }[];
  model: string;
  usage?: { total_tokens?: number };
};

/**
 * Embed a list of document texts. Results are returned in the same order as
 * `texts`. Sends inputs in batches of at most `MAX_BATCH`; the current corpus
 * fits in a single request.
 */
export async function embedDocuments(texts: string[]): Promise<EmbedResult> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set.");
  }

  const embeddings: number[][] = new Array(texts.length);
  let totalTokens = 0;

  for (let start = 0; start < texts.length; start += MAX_BATCH) {
    const batch = texts.slice(start, start + MAX_BATCH);

    const response = await fetch(VOYAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: batch,
        model: VOYAGE_MODEL,
        input_type: "document",
        output_dimension: VOYAGE_DIMENSIONS
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Voyage API error ${response.status}: ${detail.slice(0, 500)}`);
    }

    const payload = (await response.json()) as VoyageResponse;

    for (const item of payload.data) {
      const dims = item.embedding.length;
      if (dims !== VOYAGE_DIMENSIONS) {
        throw new Error(
          `Voyage returned ${dims}-dim embedding, expected ${VOYAGE_DIMENSIONS}.`
        );
      }
      // `index` is relative to this batch's input array.
      embeddings[start + item.index] = item.embedding;
    }

    totalTokens += payload.usage?.total_tokens ?? 0;
  }

  return {
    embeddings,
    model: VOYAGE_MODEL,
    dimensions: VOYAGE_DIMENSIONS,
    totalTokens
  };
}
