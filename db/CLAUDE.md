## Future consideration: multi-language content
Articles will eventually be translated into additional languages (via Claude)
once the target language list is defined. Not in scope for items 1–3, but
item 4+ should account for it:
- `ai_knowledge_documents`/`ai_knowledge_chunks` likely need a `language`
  column (schema currently has none — this means a future migration).
- Decide then: translated articles as separate documents with their own
  `source_id` (e.g. `slug--fr`), or a language variant of the same document.
- `search_vector` already uses `'simple'` config, which is language-agnostic
  by luck rather than design — fine as-is, don't switch to `'english'`.
- Embedding model choice (item 4) should be multilingual-capable if this
  ships before a single-language MVP is locked in.

## Future consideration: model routing / budget fallback
Provider interface (lib/ai/providers/types.ts) already allows swapping or
adding models via env config. Do NOT build multi-provider routing for
cost — at current scale it can't pay for itself. If budget protection is
ever needed: on hitting a monthly spend cap, switch the bot to a static
"assistant offline — contact us" mode with the WhatsApp CTA, never to a
weaker model (quality drop is the wrong failure mode for this domain).
A spend alert in the Anthropic Console covers the practical risk today.

## Future consideration: answer caching at scale
If chat volume makes model cost material (>~$100/mo), add a semantic
answer cache before downgrading models: normalize/embed incoming queries,
serve a stored approved answer on high-similarity match to a previously
answered question, zero model call. FAQ traffic is highly repetitive —
expect large hit rates. Cached answers need an admin approval/expiry
story. This is the primary cost lever; model choice (AI_CHAT_MODEL →
claude-haiku-4-5, ~3× cheaper) is the secondary one.

## Known limitation: keyword search vocabulary matching
The 'simple' FTS config does no stemming, and plainto_tsquery ANDs all
terms — so exact-lexeme, in-vocabulary phrasing works ("employment pass
documents") but near-miss phrasing doesn't ("incorporate a company" won't
match a chunk containing only "incorporation"). This is expected and by
design for item 3's scope. Item 4 (embeddings) + item 5 (hybrid retrieval)
are specifically meant to close this gap — don't try to fix it by
loosening to OR-matching or changing the FTS config in isolation.

# Atlas AI Database — Context

Scope: this file applies when working inside `db/`, `lib/ai/`, and
`scripts/` — the database foundation for the future Atlas AI assistant.

## Purpose
Postgres-backed foundation for the Atlas AI assistant: content intake →
processing/drafting → human approval → approved knowledge → chunking/
embedding → hybrid retrieval → chat.

## Requirements
- Postgres 15+
- `pgvector` — must be enabled by the database provider or installed on
  the server
- `pgcrypto` — bundled with Postgres

## Environment
```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/atlas
```

## Commands
```bash
npm run db:migrate:ai          # applies the AI foundation migration
npm run mom:import:dry-run     # preview MOM import, no writes
npm run mom:import             # run MOM import for real
```

## Tables
`ai_content_intake`, `ai_content_processing_jobs`, `ai_knowledge_drafts`,
`ai_knowledge_documents`, `ai_knowledge_chunks`, `ai_chat_sessions`,
`ai_chat_messages`, `ai_chat_events`, `ai_chat_retrieval_matches`,
`ai_feedback`, `ai_reindex_jobs`

## Pipeline — do not skip or shortcut steps
1. Owner provides raw content → stored in `ai_content_intake`
2. Processing agent creates structured records in `ai_knowledge_drafts`
3. Owner/admin reviews and approves drafts
4. Approved records become `ai_knowledge_documents`
5. Documents are chunked into `ai_knowledge_chunks`
6. Chunks receive embeddings and are retrieved via hybrid keyword + vector
   search

**Hard rule:** raw intake (step 1) is never public assistant knowledge.
Only step 4+ content may be surfaced to end users.

## MOM source import
Crawls only:
- `https://www.mom.gov.sg/passes-and-permits`
- `https://www.mom.gov.sg/employment-practices`

Imported pages land as `source_type = 'mom_page'`, `status = 'queued'` —
raw intake only. The same approval rule above applies before any of this
content reaches the assistant.

## Assistant guardrails (for the future `/api/ai/chat`)
- Answer only from approved Atlas context
- No live web browsing at answer time
- Cite or identify source content
- Never guarantee government outcomes; never invent eligibility,
  requirements, fees, timelines, or approval chances
- Escalate sensitive questions to a human consultant
- Avoid legal-advice wording
- Collect minimal personal data

## Next work, in order
1. Small DB access layer for the AI tables
2. Indexing command: sync approved local services/FAQs/articles/admin
   content into `ai_knowledge_documents`
3. Chunking + keyword search first
4. Embeddings with `pgvector`
5. `/api/ai/chat` with strict context-only prompting
6. Small chat widget on public pages
7. Admin review screens for content intake/drafts/chat gaps

## Notes
- Document metadata columns are `jsonb` on purpose — final shape is TBD
  until real Atlas documents have been reviewed.
- A stray `SELECT id, raw_content.pgsql` file may still be sitting
  untracked at the repo root from manual query testing — inspect and
  either delete it or move it into a gitignored `db/scratch/` folder.
