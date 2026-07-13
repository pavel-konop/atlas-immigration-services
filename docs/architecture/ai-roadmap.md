# Atlas AI Assistant Roadmap

This roadmap adapts the RAG/search architecture described in `ARCHITECTURE_AUDIT.md` for Atlas Immigration Services. The goal is not to copy the full AVTOMOTIV stack directly, but to reuse its strongest ideas at the right scale for an Atlas website assistant.

## Product Goal

Atlas should have a public AI assistant that helps visitors understand:

- what Atlas does and which service may fit their situation;
- how Atlas works during consultation, document review, submission support, and follow-up;
- common FAQ answers about Singapore immigration and corporate services;
- when a question needs a human consultant instead of an AI answer.

For the business owner, the assistant should be a controlled knowledge agent:

- it answers from approved Atlas knowledge only, with no live web browsing;
- it keeps model prompts small by retrieving only relevant snippets;
- it logs user questions, retrieval results, answer status, and feedback;
- it exposes repeatable commands for reindexing and optimization;
- it creates a review loop so weak answers become new FAQ/knowledge entries.

## Current Boundaries

- `lib/ai/providers/types.ts` defines the provider interface and a no-op provider for the MVP.
- `lib/ai/retrieval/localKnowledge.ts` searches approved local content without an external API.
- `content/knowledge/approved-guidance.ts` stores guardrail text for future AI behavior.
- Services, FAQs, articles, and editable admin content are already structured enough to become the first knowledge base.
- The contact flow remains deterministic and does not use an AI model.

## What To Reuse From The Audit

The audit's strongest reusable ideas are:

1. **Approved local knowledge first.** The assistant should retrieve from Atlas services, FAQs, articles, and guidance before any model call.
2. **Hybrid retrieval from day one.** Use keyword search plus vector search from the first database iteration because the business owner will provide content to populate the knowledge base.
3. **RAG answer layer.** The model receives only a short system prompt, the user question, and the top approved snippets.
4. **No live internet.** The assistant should not browse government or third-party sites at answer time. If Atlas content is insufficient, it should say so and offer consultant review.
5. **Logging and learning loop.** Store unanswered questions, low-confidence searches, clicked/contacted follow-ups, and explicit feedback.
6. **Repeatable reindexing.** Add admin/CLI commands that rebuild the index from the approved content sources.

The pieces that are too heavy for Atlas initially:

- BookStack CMS, unless Atlas later needs a full internal wiki;
- Telegram bot architecture;
- ChromaDB/FastAPI sidecar on day one;
- a separate vector database before Postgres-native vector search has been tested.

## Recommended Architecture

```mermaid
flowchart LR
    BO[Business owner content] --> INTAKE[Content intake]
    INTAKE --> AGENT[Data processing agent]
    AGENT --> DRAFTS[Structured drafts]
    DRAFTS --> REVIEW[Admin approval queue]

    subgraph Sources[Approved Atlas Content]
        S[Services]
        F[FAQs]
        A[Articles]
        G[Approved guidance]
        C[Admin content JSON]
        D[Approved DB knowledge]
    end

    REVIEW --> Sources
    Sources --> I[Index builder]
    I --> PG[(Postgres)]
    PG --> K[Knowledge index tables]

    U[Website visitor] --> W[Chat widget]
    W --> API[/api/ai/chat]
    API --> R[Retriever]
    R --> PG
    R --> P[Prompt builder]
    P --> LLM[AI provider]
    LLM --> API
    API --> W

    API --> LOG[Chat logs]
    LOG --> PG
    LOG --> GAP[Question review queue]
    GAP --> REVIEW
```

## Database Foundation

Atlas should use Postgres from the start as the system of record for AI operations.

Postgres should store:

- raw owner-provided content intake records;
- AI-processed draft knowledge records awaiting review;
- indexed knowledge documents and chunks;
- vector embeddings through `pgvector`;
- chat sessions and message history;
- retrieval events and matched sources;
- answer status, model metadata, latency, and token usage;
- feedback and owner review decisions;
- reindex job history and content hashes.

This keeps the first version simple while avoiding a migration from local JSON or SQLite later. The initial retriever should use hybrid search: Postgres full-text or keyword scoring for exact matches, plus `pgvector` embeddings for semantic matches.

## Content Processing Agent

The first database-management iteration should include an AI-assisted content processing agent. Its job is not to answer website visitors. Its job is to help the owner turn raw business content into clean, structured, searchable Atlas knowledge.

Inputs can include:

- service notes;
- process descriptions;
- FAQ drafts;
- consultant guidance;
- copied text from documents;
- article drafts;
- document checklists;
- internal owner notes.

The processing agent should:

- classify each input as service, FAQ, article, checklist, process note, guardrail, or general knowledge;
- clean formatting, remove duplicates, and split long text into clear sections;
- rewrite rough notes into professional Atlas wording while preserving meaning;
- extract candidate FAQ pairs and service-process steps;
- add metadata such as audience, category, source type, language, and review status;
- create chunk-ready text for retrieval;
- flag risky claims, missing context, approval guarantees, or legal-advice wording;
- store everything as drafts in Postgres for human approval.

Important guardrail: the processing agent may propose structure and wording, but it should not publish knowledge directly to the live assistant. A human owner/admin must approve content before it becomes searchable by the public chat assistant.

## Phase 1: Controlled Website Assistant

This is the best first build for Atlas.

### User Experience

- Add a small chat widget on public pages.
- Start with suggested prompts such as "Which service fits my situation?", "What documents should I prepare?", and "Can Atlas guarantee approval?"
- Show concise answers with source links or labels.
- Include a clear escalation action: contact Atlas, WhatsApp, or consultation request.
- Refuse or redirect sensitive questions such as approval predictions, legal advice, or questions outside Atlas services.

### Backend

- Add `app/api/ai/chat/route.ts`.
- Retrieve top local knowledge snippets with a stronger version of `searchLocalKnowledge`.
- Build a strict prompt: "Answer only from the provided Atlas context. If the context is insufficient, ask the user to contact Atlas."
- Add a provider implementation behind the existing `AiProvider` interface.
- Store sessions, messages, retrieval events, and feedback in Postgres from day one.
- Add a content-processing agent route or admin action for transforming owner-provided content into structured draft knowledge.
- Add embedding generation and `pgvector` storage as part of the initial indexing workflow.
- Keep model output short: one to four practical paragraphs, no speculative requirements, no approval guarantees.

### Retrieval

Use hybrid retrieval from the first version:

- index services, FAQs, articles, admin FAQs, and approved guidance;
- index owner-approved database knowledge created by the content processing agent;
- normalize terms, remove stopwords, and score title/question matches higher than body matches;
- generate embeddings for approved chunks and store them with `pgvector`;
- combine keyword/full-text results with vector similarity results;
- return structured citations: `source`, `id`, `title`, `href`, `snippet`;
- detect low confidence and avoid calling the model when no useful context exists.

Hybrid search gives Atlas exact matching for service names and document terms, while vector search helps when visitors ask in natural language or use different wording from the approved content.

### Logging

Every chat request should log:

- timestamp;
- session id or anonymous visitor id;
- user question;
- detected language if available;
- matched knowledge ids and scores;
- whether the model was called;
- answer status: `answered`, `clarify`, `not_found`, `escalated`, or `blocked`;
- token usage if the provider returns it;
- optional user feedback.

Use Postgres from the start. For managed hosting, Supabase, Neon, or a similar managed Postgres provider is a good fit. For self-hosting, a standard Postgres service is enough.

## Phase 2: Admin Review And Knowledge Improvement

Add an admin view that turns logs into useful business feedback:

- raw content waiting for processing;
- AI-processed content drafts waiting for approval;
- top unanswered questions;
- questions with no retrieval matches;
- questions that triggered escalation;
- repeated topics not covered by FAQs;
- suggested new FAQ or guidance drafts, reviewed by a human before publishing.

This is the highest-value business-owner feature. It creates a controlled improvement loop without letting the AI rewrite the knowledge base automatically.

## Phase 3: Indexing And Optimization Commands

Add repeatable commands:

- `npm run ai:index` rebuilds the knowledge index from approved content;
- `npm run ai:embed` generates or refreshes embeddings for approved chunks;
- `npm run ai:report` summarizes unanswered and low-confidence questions;
- `npm run ai:optimize` rebuilds synonyms/aliases from approved content and reviewed logs;
- `npm run ai:db:reindex` refreshes Postgres knowledge tables and stores job status;
- `npm run ai:process-content` runs the content processing agent on queued owner-provided material;
- scheduled reindex after admin content changes or once per day.

The first index should be stored in Postgres. Generated JSON can still be useful as a debug artifact, but it should not be the production source of truth.

## Phase 4: Hybrid RAG Scale-Up

Hybrid search should exist from day one. This phase is about making it stronger as the corpus grows:

- BM25 or MiniSearch for exact service names, pass names, document names, and FAQ wording;
- embeddings for semantic matching through `pgvector`;
- reciprocal rank fusion to merge keyword and vector results;
- optional reranking only when confidence is low;
- multilingual retrieval when Atlas adds translated content;
- a sidecar vector service only if Postgres-native search becomes a bottleneck.

For Atlas, a Python FastAPI sidecar like the audit is only worth it if the knowledge base becomes large or local embedding jobs do not fit comfortably in the Next.js deployment. Until then, prefer Postgres plus background/admin indexing jobs.

## Guardrails

The assistant must:

- answer only from approved Atlas context;
- cite or identify the source content used;
- never guarantee Singapore government outcomes;
- never invent requirements, processing times, fees, or eligibility rules;
- recommend consultant review for eligibility-sensitive cases;
- avoid legal advice language;
- avoid live web browsing at answer time;
- collect minimal personal data in chat logs.

Sensitive topics should produce an escalation response, not a confident answer. Examples:

- "Will my PR be approved?"
- "What are my chances?"
- "Can you check if MOM/ICA will accept this?"
- "What should I hide or change in my application?"

## Suggested Postgres Data Model

Core relational tables:

```text
ai_content_intake
- id
- source_name
- source_type
- raw_content
- uploaded_by
- status
- created_at

ai_content_processing_jobs
- id
- intake_id -> ai_content_intake.id
- status
- model_name
- error
- started_at
- finished_at

ai_knowledge_drafts
- id
- intake_id -> ai_content_intake.id
- draft_type
- title
- body
- metadata_json
- risk_flags_json
- review_status
- reviewed_by
- created_at
- updated_at

ai_chat_sessions
- id
- created_at
- last_seen_at
- source_page
- locale
- visitor_hash

ai_chat_messages
- id
- session_id -> ai_chat_sessions.id
- role
- content
- created_at

ai_chat_events
- id
- session_id -> ai_chat_sessions.id
- message_id -> ai_chat_messages.id
- question
- normalized_question
- matched_sources_json
- answer_status
- model_name
- prompt_tokens
- completion_tokens
- latency_ms
- created_at

ai_feedback
- id
- event_id -> ai_chat_events.id
- rating
- comment
- reviewed_by
- review_status
- created_at
```

Knowledge and indexing tables from the start:

```text
ai_knowledge_documents
- id
- draft_id -> ai_knowledge_drafts.id
- source_type
- source_id
- title
- href
- body
- metadata_json
- hash
- enabled
- last_indexed_at
- updated_at

ai_knowledge_chunks
- id
- document_id -> ai_knowledge_documents.id
- chunk_index
- text
- tokens
- search_vector
- embedding
- embedding_model
- updated_at

ai_reindex_jobs
- id
- status
- started_at
- finished_at
- documents_seen
- documents_changed
- embeddings_changed
- error
```

Enable `pgvector` in Phase 1. `embedding` may be temporarily nullable while a document is waiting for indexing, but approved public knowledge should have embeddings before it is used by the assistant.

## Implementation Order

1. Add Postgres schema for content intake, processing jobs, drafts, knowledge, chunks, embeddings, sessions, messages, events, feedback, and reindex jobs.
2. Enable `pgvector` and choose the first embedding model/provider.
3. Add the content processing agent for restructuring owner-provided content into draft database records.
4. Add human review/approval before processed drafts become public assistant knowledge.
5. Store approved documents/chunks in Postgres and generate embeddings from day one.
6. Add hybrid source-aware retrieval over Postgres full-text/keyword results plus vector similarity.
7. Add `/api/ai/chat` with no live web access and strict guardrails.
8. Add a simple chat UI component.
9. Add request logging and feedback capture.
10. Add admin review of unanswered/low-confidence questions.
11. Add reindex, embedding refresh, reporting, and content-processing scripts.

## Key Improvement Over The Audit For Atlas

The audit focuses on a mature internal knowledge search system. Atlas needs a visitor-facing trust assistant first. The biggest improvement is to treat the AI as a **conversion and guidance layer**, not just a search box:

- answer common questions quickly;
- explain Atlas's process clearly;
- know when to stop;
- route real cases to a consultant;
- give the owner a backlog of content gaps.

This keeps costs low, reduces hallucination risk, and makes each logged question useful for improving Atlas content.
