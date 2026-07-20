# Atlas Immigration Services — Project Context

## What this is
Atlas Immigration Services Pte Ltd website: a production-quality MVP for a
Singapore immigration and corporate services consultancy. Serves individuals,
families, entrepreneurs, and employer/company audiences.

## Stack
- Next.js App Router (`next@16.2.9`)
- React `19.2.7`
- TypeScript
- Tailwind CSS
- Motion
- Content: local file-backed (see Content Model below)
- Future AI/RAG architecture lives under `lib/ai/` — see @db/CLAUDE.md and
  @docs/architecture/ai-roadmap.md

## Standing rules (always apply)
- Never discard or overwrite uncommitted changes without explicit approval
  first — ask before touching anything not already committed.
- Raw content imported into `ai_content_intake` (e.g. MOM pages) is **not**
  public assistant knowledge. It only becomes usable after the content
  processing agent converts it into an Atlas-owned draft AND a human/admin
  approves it. Never wire raw intake content directly into anything
  user-facing.

## Commands
```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```
Note: `npm run build` may fail inside a restricted sandbox because Turbopack
tries to bind a local port while processing CSS. That's expected there, not
a real bug — it compiles fine outside the sandbox.

## Business config
- `content/config/business.ts` — company/contact details
- `content/config/navigation.ts` — nav & CTA labels
- `content/config/languages.ts` — language readiness
- `content/config/origins.ts` — approved client origins
- `content/config/testimonials.ts` — testimonials visibility

## Routes
- Public: `/`, `/about`, `/services`, `/services/[slug]`, `/insights`,
  `/insights/[slug]`, `/faq`, `/contact`, `/privacy`, `/terms`
- Variant/testing: `/v1`, `/v2`
- Admin: `/admin`
- API: `/api/contact`, `/api/admin/login`, `/api/admin/logout`,
  `/api/admin/content`

## Content model
- `content/services/index.ts` — service definitions (Employment Pass, S Pass,
  Dependant's Pass, Permanent Residency, Long-Term Visit Pass, Company
  Incorporation, Corporate Secretary, Corporate Compliance Support)
- `content/faqs/index.ts` — fallback FAQs
- `content/articles/*.md` — article content
- `content/knowledge/approved-guidance.ts` — approved AI guardrail knowledge
- `content/admin/site-content.json` — admin-managed homepage/showcase/
  articles/FAQ content (edited via `/admin`; `lib/admin/content.ts`
  normalizes and saves it; local fallback password is `atlas-admin`)
- Homepage: `app/page.tsx` → `HomeVariantPage variant="v1"` →
  `components/sections/HomeVariant.tsx` (`ContinuousStorySection`,
  `WhyAtlas`, `ShowcaseMarquee`)

## Known gaps — don't assume these are done
- `/api/contact` validates the payload but doesn't send email yet
- No public AI chat route or widget yet
- No real AI provider implementation yet (current provider is a no-op)
- No DB access layer yet — only schema/types/import script exist
- Admin content is file-backed — not production-safe on immutable hosting
- The MOM importer needs `DATABASE_URL` and shells out to `psql`

## AI / RAG work
This repo has a database foundation for a future AI assistant. See
@db/CLAUDE.md for that subsystem's context, and
@docs/architecture/ai-roadmap.md for the phased build-out plan.
