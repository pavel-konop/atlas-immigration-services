# Atlas Immigration Services Website

Production-quality MVP website for Atlas Immigration Services Pte Ltd, built with Next.js App Router, TypeScript, Tailwind CSS, Motion, local content files, and a future-ready AI boundary.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Editing Workflow

- Admin content manager: visit `/admin`, log in with `ADMIN_PASSWORD`, edit the JSON, save, preview, and log out.
- Admin-backed content: `content/admin/site-content.json`
- Contact details: `content/config/business.ts`
- Navigation and CTA wording: `content/config/navigation.ts`
- Language readiness: `content/config/languages.ts`
- Approved client-origin locations: `content/config/origins.ts`
- Testimonials visibility: `content/config/testimonials.ts`
- Services and descriptions: `content/services/index.ts`
- FAQs: `content/faqs/index.ts`
- Articles: add or edit Markdown files in `content/articles/`
- Approved AI knowledge: `content/knowledge/approved-guidance.ts`

The admin file controls the continuous showcase rail, the horizontal audience journey, service overrides, and article overrides.
It is file-backed for this build. For immutable production hosting, move this content store to a database or managed CMS while keeping the same content shape.

Article files use front matter:

```md
---
title: "Article title"
description: "Short summary"
date: "2026-06-05"
category: "Immigration"
featured: true
---
```

## Routes

- `/`
- `/admin`
- `/services`
- `/services/[slug]`
- `/about`
- `/insights`
- `/insights/[slug]`
- `/faq`
- `/contact`
- `/privacy`
- `/terms`

## Brand Assets

Current brand assets are copied into `public/brand/`. The header uses `public/brand/atlas-logo-small.jpg`; official logo source files can replace this later without changing page code.

## AI Roadmap

The MVP does not require an AI API key. Future AI support is isolated under `lib/ai/` with local retrieval over approved content. See `docs/architecture/ai-roadmap.md`.
