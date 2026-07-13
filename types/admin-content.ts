export type ShowcaseItemType = "photo" | "feedback" | "article";

export type ShowcaseItem = {
  id: string;
  type: ShowcaseItemType;
  title: string;
  context: string;
  image: string;
  href: string;
  enabled: boolean;
};

export type PhotoItem = {
  id: string;
  title: string;
  context: string;
  image: string;
  href: string;
  enabled: boolean;
  createdAt: string;
};

export type FeedbackItem = {
  id: string;
  title: string;
  context: string;
  href: string;
  enabled: boolean;
  createdAt: string;
};

export type InsightItem = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  content: string;
  featured: boolean;
  enabled: boolean;
};

export type FAQItem = {
  id: string;
  category: "General" | "Immigration" | "Corporate";
  question: string;
  answer: string;
  enabled: boolean;
};

export type ShowcaseReference = {
  type: ShowcaseItemType;
  id: string;
};

export type AudienceJourneySlide = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  services: string[];
  enabled: boolean;
};

export type ServiceOverride = {
  title?: string;
  summary?: string;
  description?: string;
};

export type ArticleOverride = {
  title?: string;
  description?: string;
  category?: string;
  featured?: boolean;
};

export type SiteContent = {
  showcase: {
    eyebrow: string;
    title: string;
    mode: "recentInsights" | "manual";
    recentInsightCount: number;
    selectedItems: ShowcaseReference[];
    items?: ShowcaseItem[];
  };
  contentLibrary: {
    photos: PhotoItem[];
    feedbacks: FeedbackItem[];
    insights: InsightItem[];
  };
  faqs: FAQItem[];
  audienceJourney: {
    eyebrow: string;
    title: string;
    slides: AudienceJourneySlide[];
  };
  serviceOverrides: Record<string, ServiceOverride>;
  articleOverrides: Record<string, ArticleOverride>;
};
