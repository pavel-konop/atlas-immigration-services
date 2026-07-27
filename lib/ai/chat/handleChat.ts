import { business } from "@/content/config/business";
import {
  providerFailureReply,
  retrievalTurnInstructions,
  sessionCappedReply
} from "@/content/knowledge/agent-rules";
import {
  countUserChatMessages,
  createChatSession,
  getChatSessionById,
  getChunksByIds,
  getRecentChatMessages,
  insertChatEvent,
  insertChatMessage,
  insertRetrievalMatches,
  mergeChatSessionMetadata,
  touchChatSession,
  type RetrievalMatchInput
} from "@/lib/ai/database/repositories";
import type { ChatAnswerStatus, JsonObject, JsonValue } from "@/lib/ai/database/types";
import { getChatProvider } from "@/lib/ai/providers";
import type { AiMessage } from "@/lib/ai/providers/types";
import { hybridSearch, type HybridResult, type MatchedBy } from "@/lib/ai/retrieval/hybridSearch";
import type { RetrievalMethod } from "@/lib/ai/database/types";
import { generateRefCode } from "./refCode";
import { buildContextTurn, buildSystemBlocks, type ContextSnippet } from "./systemPrompt";
import { extractVolunteeredDetails } from "./volunteered";

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TURNS = 10;
const HISTORY_LIMIT = 8;
const CONTEXT_CHUNKS = 5;

export type ChatTurnInput = {
  sessionId?: string | null;
  message: string;
  sourcePage?: string | null;
  locale?: string | null;
  userAgent?: string | null;
  visitorHash?: string | null;
};

export type ChatSource = { title: string; href: string | null };
export type ChatCta = { type: "whatsapp"; url: string; label: string };

export type ChatTurnResult = {
  sessionId: string;
  refCode: string;
  reply: string;
  confidence: "strong" | "weak" | "none";
  sources: ChatSource[];
  cta?: ChatCta;
};

const whatsappCta: ChatCta = {
  type: "whatsapp",
  url: business.whatsappHref,
  label: "WhatsApp Us"
};

function matchedByToMethod(matchedBy: MatchedBy): RetrievalMethod {
  return matchedBy === "both" ? "hybrid" : matchedBy;
}

/** Dedupe retrieval hits into per-document {title, href} citations. */
function toSources(results: HybridResult[]): ChatSource[] {
  const seen = new Set<string>();
  const sources: ChatSource[] = [];
  for (const r of results) {
    const key = r.documentId ?? `${r.sourceType}:${r.sourceId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ title: r.title, href: r.href });
  }
  return sources;
}

function retrievalMatchInputs(eventId: string, results: HybridResult[]): RetrievalMatchInput[] {
  return results.map((r) => ({
    eventId,
    documentId: r.documentId,
    chunkId: r.chunkId,
    retrievalMethod: matchedByToMethod(r.matchedBy),
    rank: r.vectorRank ?? r.keywordRank ?? 0,
    score: r.rrfScore,
    snippet: r.snippet,
    metadata: {
      matchedBy: r.matchedBy,
      cosineSimilarity: r.cosineSimilarity,
      keywordScore: r.keywordScore
    } as JsonObject
  }));
}

/** Resolve an existing session by id, or create a new one with a unique ref code. */
async function resolveSession(input: ChatTurnInput) {
  if (input.sessionId) {
    const existing = await getChatSessionById(input.sessionId);
    if (existing) return existing;
  }
  // Retry a few times on the (rare) ref-code unique collision.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await createChatSession({
        refCode: generateRefCode(),
        visitorHash: input.visitorHash ?? null,
        sourcePage: input.sourcePage ?? null,
        locale: input.locale ?? null,
        userAgent: input.userAgent ?? null
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("ref_code")) throw error;
    }
  }
  throw new Error("Could not allocate a unique chat ref code.");
}

/**
 * Run one chat turn: resolve the session, enforce the turn cap, retrieve
 * context, branch on confidence, call the model when warranted, and log
 * messages, the answer event, and retrieval matches. Shared by the API route
 * and the ai:chat CLI so both exercise identical behavior.
 *
 * Callers must enforce MAX_MESSAGE_LENGTH before calling this.
 */
export async function handleChatTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
  const message = input.message.trim();
  const session = await resolveSession(input);
  await touchChatSession(session.id);

  const priorUserTurns = await countUserChatMessages(session.id);
  const currentTurn = priorUserTurns + 1;

  // --- Turn cap: static close, no retrieval, no model call ---
  if (priorUserTurns >= MAX_TURNS) {
    const userMsg = await insertChatMessage(session.id, "user", message);
    const assistantMsg = await insertChatMessage(session.id, "assistant", sessionCappedReply);
    await insertChatEvent({
      sessionId: session.id,
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      question: message,
      answerStatus: "escalated",
      guardrailFlags: ["session_capped", "cta_shown"]
    });
    return {
      sessionId: session.id,
      refCode: session.refCode ?? "",
      reply: sessionCappedReply,
      confidence: "none",
      sources: [],
      cta: whatsappCta
    };
  }

  // History must be loaded BEFORE persisting the current message.
  const history = await getRecentChatMessages(session.id, HISTORY_LIMIT);
  const userMsg = await insertChatMessage(session.id, "user", message);

  // Capture anything the visitor volunteered (best-effort, PDPA-minimal).
  const volunteered = extractVolunteeredDetails(message);
  if (Object.keys(volunteered).length > 0) {
    await mergeChatSessionMetadata(session.id, volunteered as JsonObject);
  }

  const startedAt = Date.now();
  const search = await hybridSearch(message, CONTEXT_CHUNKS);
  const topResults = search.results.slice(0, CONTEXT_CHUNKS);
  const sources = toSources(topResults);

  let reply: string;
  let answerStatus: ChatAnswerStatus;
  const guardrailFlags: JsonValue[] = [];
  let modelName: string | null = null;
  let promptTokens: number | null = null;
  let completionTokens: number | null = null;
  let cta: ChatCta | undefined;
  let providerFailed = false;

  // Keyword-only fallback when the embedding provider was down — logged so
  // retrieval outages are visible in analytics.
  if (search.degraded) guardrailFlags.push("retrieval_degraded");

  // All three confidence levels call the model, each with a branch-specific
  // instruction. `none` is given NO context (empty snippets): it replies
  // conversationally and states zero facts. Static replies remain only for the
  // turn cap (above), rate limiting (the route), and provider failure (below).
  const branchInstruction =
    search.confidence === "strong"
      ? retrievalTurnInstructions.strong
      : search.confidence === "weak"
        ? retrievalTurnInstructions.weak
        : retrievalTurnInstructions.none;

  const snippets: ContextSnippet[] =
    search.confidence === "none"
      ? []
      : await buildSnippets(topResults, search.confidence === "strong");

  const contextTurn = buildContextTurn(message, snippets, branchInstruction);
  const providerMessages: AiMessage[] = [
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: contextTurn }
  ];

  try {
    const result = await getChatProvider().generate(providerMessages, {
      system: buildSystemBlocks()
    });

    reply = result.text;
    modelName = result.model;
    promptTokens = result.usage.inputTokens + result.usage.cacheReadTokens + result.usage.cacheWriteTokens;
    completionTokens = result.usage.outputTokens;

    if (search.confidence === "strong") {
      answerStatus = "answered";
      // Soft pivot to the CTA by turn 3-4.
      if (currentTurn >= 3) {
        guardrailFlags.push("cta_shown");
        cta = whatsappCta;
      }
    } else if (search.confidence === "weak") {
      answerStatus = "escalated";
      guardrailFlags.push("weak_context", "cta_shown");
      cta = whatsappCta;
    } else {
      // none: answered conversationally with no context. Keep the verdict in the
      // logs as `not_found` so none turns stay distinguishable in analytics.
      answerStatus = "not_found";
      guardrailFlags.push("cta_shown");
      cta = whatsappCta;
    }
  } catch (error) {
    // Provider outage (auth/credit exhaustion, rate limit, overload, network):
    // degrade to a static reply that reuses the retrieval we already have.
    // No retries and no model fallback chain for the MVP. Logged as a distinct
    // provider_failure event (with the error class) so outages are visible.
    const errorClass = error instanceof Error ? error.constructor.name : "UnknownError";
    console.error("[chat] provider failure", error);
    providerFailed = true;
    reply = providerFailureReply;
    answerStatus = "error";
    guardrailFlags.push("provider_failure", errorClass, "cta_shown");
    cta = whatsappCta;
    // modelName / token counts stay null: no successful model call.
  }

  const assistantMsg = await insertChatMessage(session.id, "assistant", reply);

  const event = await insertChatEvent({
    sessionId: session.id,
    userMessageId: userMsg.id,
    assistantMessageId: assistantMsg.id,
    question: message,
    answerStatus,
    modelName,
    promptTokens,
    completionTokens,
    latencyMs: Date.now() - startedAt,
    matchedSources: topResults.map((r) => ({
      sourceType: r.sourceType,
      sourceId: r.sourceId,
      title: r.title,
      href: r.href,
      matchedBy: r.matchedBy,
      rrfScore: r.rrfScore
    })) as JsonValue[],
    guardrailFlags
  });

  if (topResults.length > 0) {
    await insertRetrievalMatches(retrievalMatchInputs(event.id, topResults));
  }

  return {
    sessionId: session.id,
    refCode: session.refCode ?? "",
    reply,
    confidence: search.confidence,
    // On provider failure, surface at most 3 of the already-computed sources.
    sources: providerFailed ? sources.slice(0, 3) : sources,
    cta
  };
}

/** Full chunk text for strong answers; highlighted snippets for weak ones. */
async function buildSnippets(
  results: HybridResult[],
  strong: boolean
): Promise<ContextSnippet[]> {
  if (!strong) {
    return results.slice(0, 3).map((r) => ({ title: r.title, text: r.snippet }));
  }
  const chunks = await getChunksByIds(results.map((r) => r.chunkId));
  const textById = new Map(chunks.map((c) => [c.id, c.chunkText]));
  return results.map((r) => ({ title: r.title, text: textById.get(r.chunkId) ?? r.snippet }));
}
