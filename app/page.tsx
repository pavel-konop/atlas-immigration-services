import { AudienceJourneyScroller } from "@/components/sections/AudienceJourneyScroller";
import { Hero } from "@/components/sections/Hero";
import { InsightsPreview } from "@/components/sections/InsightsPreview";
import { Process } from "@/components/sections/Process";
import { RouteMapSection } from "@/components/sections/RouteMapSection";
import { ShowcaseMarquee } from "@/components/sections/ShowcaseMarquee";
import { WhyAtlas } from "@/components/sections/WhyAtlas";
import { getSiteContent } from "@/lib/admin/content";
import { getFeaturedArticles } from "@/lib/content/articles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getFeaturedArticles(3);
  const siteContent = await getSiteContent();

  return (
    <>
      <Hero />
      <RouteMapSection />
      <AudienceJourneyScroller
        eyebrow={siteContent.audienceJourney.eyebrow}
        title={siteContent.audienceJourney.title}
        slides={siteContent.audienceJourney.slides}
      />
      <ShowcaseMarquee
        eyebrow={siteContent.showcase.eyebrow}
        title={siteContent.showcase.title}
        items={siteContent.showcase.items}
      />
      <WhyAtlas />
      <Process />
      <InsightsPreview articles={articles} />
    </>
  );
}
