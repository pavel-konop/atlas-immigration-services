/**
 * Pure, DB-free chunking for approved knowledge documents.
 *
 * Splits a document's plain-text body into reasonably sized chunks ready for
 * `ai_knowledge_chunks`. Embeddings are NOT handled here (roadmap item 4) — the
 * output feeds keyword search via the generated `search_vector` column.
 *
 * The functions here are deterministic and side-effect free so they can be
 * unit-tested without a database.
 */

/** Target chunk size in characters; packing fills up to this before starting a new chunk. */
export const TARGET_CHARS = 1000;
/** Hard cap in characters; a single paragraph longer than this is split on sentence boundaries. */
export const MAX_CHARS = 1400;

export type ChunkSourceType = "service" | "faq" | "article" | string;

export type ChunkableDocument = {
  sourceType: ChunkSourceType;
  title: string;
  body: string;
};

/** Rough token estimate (~4 chars/token). Real counts arrive with the embedding model in item 4. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Split text into paragraphs on blank lines, trimming and dropping empties. */
function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Split an over-long paragraph into sentence-aligned pieces no larger than MAX_CHARS. */
function splitLongParagraph(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [paragraph];
  const pieces: string[] = [];
  let current = "";

  for (const sentenceRaw of sentences) {
    const sentence = sentenceRaw.trim();
    if (!sentence) continue;

    if (sentence.length > MAX_CHARS) {
      // A single sentence still too long — hard-slice it so nothing exceeds the cap.
      if (current) {
        pieces.push(current);
        current = "";
      }
      for (let i = 0; i < sentence.length; i += MAX_CHARS) {
        pieces.push(sentence.slice(i, i + MAX_CHARS).trim());
      }
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > MAX_CHARS) {
      pieces.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) pieces.push(current);
  return pieces;
}

/** Greedily pack paragraphs into chunks up to TARGET_CHARS, splitting any that exceed MAX_CHARS. */
function packParagraphs(paragraphs: string[]): string[] {
  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current) {
      chunks.push(current);
      current = "";
    }
  };

  for (const paragraph of paragraphs) {
    const parts = paragraph.length > MAX_CHARS ? splitLongParagraph(paragraph) : [paragraph];

    for (const part of parts) {
      const candidate = current ? `${current}\n\n${part}` : part;
      if (candidate.length > TARGET_CHARS && current) {
        flush();
        current = part;
      } else {
        current = candidate;
      }
    }
  }

  flush();
  return chunks;
}

/**
 * Chunk a document into ordered chunk texts.
 *
 * - `faq`: a single chunk of `title` + body so the question's keywords are searchable.
 * - everything else: paragraph packing to TARGET_CHARS, with the title prepended to the
 *   first chunk only (makes the document name searchable without inflating every chunk).
 */
export function chunkDocument(doc: ChunkableDocument): string[] {
  const title = doc.title.trim();
  const body = doc.body.trim();

  if (doc.sourceType === "faq") {
    const text = title && body ? `${title}\n\n${body}` : title || body;
    return text ? [text] : [];
  }

  const chunks = packParagraphs(toParagraphs(body));

  if (chunks.length === 0) {
    return title ? [title] : [];
  }

  chunks[0] = title ? `${title}\n\n${chunks[0]}` : chunks[0];
  return chunks;
}
