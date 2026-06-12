import { approvedKnowledge } from "@/content/knowledge/approved-guidance";
import { services } from "@/content/services";
import { faqs } from "@/content/faqs";

export type KnowledgeResult = {
  id: string;
  title: string;
  body: string;
  source: "service" | "faq" | "approved-guidance";
};

export function searchLocalKnowledge(query: string, limit = 5): KnowledgeResult[] {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 2);

  const entries: KnowledgeResult[] = [
    ...services.map((service) => ({
      id: service.slug,
      title: service.title,
      body: `${service.summary} ${service.description}`,
      source: "service" as const
    })),
    ...faqs.map((faq, index) => ({
      id: `faq-${index}`,
      title: faq.question,
      body: faq.answer,
      source: "faq" as const
    })),
    ...approvedKnowledge.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      source: "approved-guidance" as const
    }))
  ];

  return entries
    .map((entry) => ({
      entry,
      score: terms.reduce((score, term) => {
        const haystack = `${entry.title} ${entry.body}`.toLowerCase();
        return score + (haystack.includes(term) ? 1 : 0);
      }, 0)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
