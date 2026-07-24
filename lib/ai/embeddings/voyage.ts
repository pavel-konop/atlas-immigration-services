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

type VoyageInputType = "document" | "query";

/** Single Voyage request for one batch of inputs. Returns vectors in input order. */
async function requestEmbeddings(
  inputs: string[],
  inputType: VoyageInputType
): Promise<{ embeddings: number[][]; tokens: number }> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set.");
  }

  const response = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: inputs,
      model: VOYAGE_MODEL,
      input_type: inputType,
      output_dimension: VOYAGE_DIMENSIONS
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Voyage API error ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload = (await response.json()) as VoyageResponse;
  const embeddings: number[][] = new Array(inputs.length);

  for (const item of payload.data) {
    const dims = item.embedding.length;
    if (dims !== VOYAGE_DIMENSIONS) {
      throw new Error(`Voyage returned ${dims}-dim embedding, expected ${VOYAGE_DIMENSIONS}.`);
    }
    // `index` is relative to this request's input array.
    embeddings[item.index] = item.embedding;
  }

  return { embeddings, tokens: payload.usage?.total_tokens ?? 0 };
}

/**
 * Embed a list of document texts (`input_type: "document"`). Results are
 * returned in the same order as `texts`. Sends inputs in batches of at most
 * `MAX_BATCH`; the current corpus fits in a single request.
 */
export async function embedDocuments(texts: string[]): Promise<EmbedResult> {
  const embeddings: number[][] = new Array(texts.length);
  let totalTokens = 0;

  for (let start = 0; start < texts.length; start += MAX_BATCH) {
    const batch = texts.slice(start, start + MAX_BATCH);
    const { embeddings: batchEmbeddings, tokens } = await requestEmbeddings(batch, "document");
    for (let i = 0; i < batchEmbeddings.length; i += 1) {
      embeddings[start + i] = batchEmbeddings[i];
    }
    totalTokens += tokens;
  }

  return {
    embeddings,
    model: VOYAGE_MODEL,
    dimensions: VOYAGE_DIMENSIONS,
    totalTokens
  };
}

/**
 * Embed a single search query (`input_type: "query"`) with the same model and
 * dimensions as the documents, so query and chunk vectors are comparable.
 */
export async function embedQuery(text: string): Promise<{ embedding: number[]; tokens: number }> {
  const { embeddings, tokens } = await requestEmbeddings([text], "query");
  return { embedding: embeddings[0], tokens };
}
