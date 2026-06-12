# Atlas AI Roadmap

The MVP is intentionally content-first. Services, FAQs, articles, approved guidance, language settings, navigation, contact details, and approved client-origin locations are local structured files.

## Current Boundaries

- `lib/ai/providers/types.ts` defines the provider interface and a no-op provider for the MVP.
- `lib/ai/retrieval/localKnowledge.ts` searches approved local content without an external API.
- `content/knowledge/approved-guidance.ts` stores guardrail text for future AI behavior.
- The contact flow remains deterministic and does not use an AI model.

## Future Additions

1. Add a provider implementation in `lib/ai/providers/`.
2. Add an API route that retrieves from approved content before calling the provider.
3. Require citations to service, FAQ, article, or approved guidance records.
4. Escalate eligibility-sensitive or approval-probability questions to a human consultant.
5. Add language-specific content directories or locale keys before enabling `zh-Hans` or `ja`.

## Guardrails

Future AI features should not guarantee government outcomes, invent requirements, or answer from unapproved web content. When facts are missing, the assistant should ask for consultant review.
