import type { FAQItem, FeedbackItem, InsightItem, PhotoItem } from "@/types/admin-content";

/**
 * Factories for new content items — ported verbatim from the previous editor so
 * newly-created records keep the same default shape the site expects.
 */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function newPhoto(): PhotoItem {
  return {
    id: `photo-${Date.now()}`,
    title: "New photo",
    context: "Short context for this image.",
    image: "/images/atlas-consultation-team.png",
    href: "/contact",
    enabled: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };
}

export function newFeedback(): FeedbackItem {
  return {
    id: `feedback-${Date.now()}`,
    title: "New feedback",
    context: "Client feedback goes here.",
    href: "/about",
    enabled: true,
    createdAt: new Date().toISOString().slice(0, 10)
  };
}

export function newInsight(): InsightItem {
  return {
    slug: `new-insight-${Date.now()}`,
    title: "New insight",
    description: "Short description for the insight index and homepage tile.",
    date: new Date().toISOString().slice(0, 10),
    category: "Immigration",
    image: "/images/atlas-corporate-review.png",
    content: "Intro paragraph.\n\n## Section heading\n\nArticle body goes here.",
    featured: false,
    enabled: true
  };
}

export function newFaq(): FAQItem {
  return {
    id: `faq-${Date.now()}`,
    category: "General",
    question: "New question?",
    answer: "Answer goes here.",
    enabled: true
  };
}
