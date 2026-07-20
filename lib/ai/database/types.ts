export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export const contentIntakeStatuses = ["queued", "processing", "processed", "failed", "archived"] as const;
export type ContentIntakeStatus = (typeof contentIntakeStatuses)[number];

export const contentProcessingJobStatuses = ["queued", "running", "completed", "failed", "cancelled"] as const;
export type ContentProcessingJobStatus = (typeof contentProcessingJobStatuses)[number];

export const knowledgeDraftTypes = [
  "service",
  "faq",
  "article",
  "checklist",
  "process_note",
  "guardrail",
  "general_knowledge"
] as const;
export type KnowledgeDraftType = (typeof knowledgeDraftTypes)[number];

export const reviewStatuses = ["pending", "approved", "needs_changes", "rejected", "archived"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export const chatAnswerStatuses = ["answered", "clarify", "not_found", "escalated", "blocked", "error"] as const;
export type ChatAnswerStatus = (typeof chatAnswerStatuses)[number];

export const retrievalMethods = ["keyword", "vector", "hybrid", "manual"] as const;
export type RetrievalMethod = (typeof retrievalMethods)[number];

export const feedbackRatings = ["positive", "negative", "neutral"] as const;
export type FeedbackRating = (typeof feedbackRatings)[number];

export const feedbackReviewStatuses = ["unreviewed", "reviewed", "converted_to_content", "ignored"] as const;
export type FeedbackReviewStatus = (typeof feedbackReviewStatuses)[number];

export const reindexJobTypes = ["content_sync", "chunking", "embedding", "full_reindex", "report", "optimization"] as const;
export type ReindexJobType = (typeof reindexJobTypes)[number];

export const reindexJobStatuses = ["queued", "running", "completed", "failed", "cancelled"] as const;
export type ReindexJobStatus = (typeof reindexJobStatuses)[number];

export type ContentIntakeRecord = {
  id: string;
  sourceName: string;
  sourceType: string;
  rawContent: string;
  rawMimeType: string | null;
  originalFilename: string | null;
  sourceUrl: string | null;
  uploadedBy: string | null;
  status: ContentIntakeStatus;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeDraftRecord = {
  id: string;
  intakeId: string | null;
  processingJobId: string | null;
  draftType: KnowledgeDraftType;
  title: string;
  body: string;
  summary: string | null;
  language: string;
  metadata: JsonObject;
  structuredContent: JsonObject;
  riskFlags: JsonValue[];
  reviewStatus: ReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeDocumentRecord = {
  id: string;
  draftId: string | null;
  sourceType: string;
  sourceId: string;
  title: string;
  slug: string | null;
  href: string | null;
  summary: string | null;
  body: string;
  language: string;
  metadata: JsonObject;
  contentHash: string;
  enabled: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  lastIndexedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeChunkRecord = {
  id: string;
  documentId: string;
  chunkIndex: number;
  chunkText: string;
  tokenCount: number | null;
  metadata: JsonObject;
  embeddingModel: string | null;
  embeddingDimensions: number | null;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
};

export type RetrievalMatchRecord = {
  id: string;
  eventId: string;
  documentId: string | null;
  chunkId: string | null;
  retrievalMethod: RetrievalMethod;
  rank: number;
  score: number | null;
  snippet: string | null;
  metadata: JsonObject;
  createdAt: string;
};
