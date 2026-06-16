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
    items: ShowcaseItem[];
  };
  audienceJourney: {
    eyebrow: string;
    title: string;
    slides: AudienceJourneySlide[];
  };
  serviceOverrides: Record<string, ServiceOverride>;
  articleOverrides: Record<string, ArticleOverride>;
};
