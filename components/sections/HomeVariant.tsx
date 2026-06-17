import { ContinuousStorySection } from "@/components/sections/ContinuousStorySection";
import { InsightsPreview } from "@/components/sections/InsightsPreview";
import { Process } from "@/components/sections/Process";
import { ShowcaseMarquee } from "@/components/sections/ShowcaseMarquee";
import { WhyAtlas } from "@/components/sections/WhyAtlas";
import { getSiteContent } from "@/lib/admin/content";
import { getFeaturedArticles } from "@/lib/content/articles";

export type HomeVariant = "v1" | "v2" | "v3";

export async function HomeVariantPage({ variant = "v1" }: { variant?: HomeVariant }) {
  const articles = await getFeaturedArticles(3);
  const siteContent = await getSiteContent();

  return (
    <>
      <ContinuousStorySection slides={siteContent.audienceJourney.slides} variant={variant} />
      <ShowcaseMarquee
        eyebrow={siteContent.showcase.eyebrow}
        title={siteContent.showcase.title}
        items={siteContent.showcase.items}
        variant={variant}
      />
      <WhyAtlas />
      <Process />
      <InsightsPreview articles={articles} />
    </>
  );
}
