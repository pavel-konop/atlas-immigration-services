# Atlas AI Database

This folder contains the database foundation for the Atlas AI assistant.

## Requirements

- Postgres 15+
- `pgvector`
- `pgcrypto`

`pgcrypto` is included with Postgres. `pgvector` must be enabled by the database provider or installed on the server.

## Environment

Set `DATABASE_URL` in `.env`:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/atlas
```

## Apply The First Migration

```bash
npm run db:migrate:ai
```

This creates:

- content intake tables for raw owner-provided material;
- processing-job and draft tables for the internal content processing agent;
- approved knowledge document and chunk tables;
- `pgvector` embedding storage;
- chat session, message, event, retrieval-match, and feedback tables;
- reindex job history.

## First Implementation Flow

1. Owner provides raw content.
2. Content is stored in `ai_content_intake`.
3. The processing agent creates structured records in `ai_knowledge_drafts`.
4. Owner/admin reviews and approves drafts.
5. Approved records become `ai_knowledge_documents`.
6. Documents are chunked into `ai_knowledge_chunks`.
7. Chunks receive embeddings and are retrieved by hybrid keyword + vector search.

## Notes

The first migration keeps document metadata flexible with `jsonb` columns because the final shape should be decided after reviewing real Atlas documents.

## MOM Source Import

MOM pages can be imported as raw source intake records:

```bash
npm run mom:import:dry-run
npm run mom:import
```

The importer crawls only:

- `https://www.mom.gov.sg/passes-and-permits`
- `https://www.mom.gov.sg/employment-practices`

Imported pages are stored as `source_type = 'mom_page'` with `status = 'queued'`. They are not public assistant knowledge until the content processing agent converts them into Atlas-owned drafts and an admin approves them.
