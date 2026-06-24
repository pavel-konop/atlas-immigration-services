import { ContinuousStorySection } from "@/components/sections/ContinuousStorySection";
import { InsightsPreview } from "@/components/sections/InsightsPreview";
import { MerlionV4Experience } from "@/components/sections/MerlionV4Experience";
import { Process } from "@/components/sections/Process";
import { ShowcaseMarquee } from "@/components/sections/ShowcaseMarquee";
import { EditorialV2Experience, SignalV3Experience } from "@/components/sections/VariantExperiences";
import { WhyAtlas } from "@/components/sections/WhyAtlas";
import { getSiteContent } from "@/lib/admin/content";
import { getFeaturedArticles } from "@/lib/content/articles";

export type HomeVariant = "v1" | "v2" | "v3" | "v4";

export async function HomeVariantPage({ variant = "v1" }: { variant?: HomeVariant }) {
  const articles = await getFeaturedArticles(3);
  const siteContent = await getSiteContent();

  if (variant === "v2") {
    return <EditorialV2Experience slides={siteContent.audienceJourney.slides} articles={articles} showcaseItems={siteContent.showcase.items} />;
  }

  if (variant === "v3") {
    return <SignalV3Experience slides={siteContent.audienceJourney.slides} articles={articles} showcaseItems={siteContent.showcase.items} />;
  }

  if (variant === "v4") {
    return <MerlionV4Experience slides={siteContent.audienceJourney.slides} />;
  }

  return (
    <>
      <ContinuousStorySection slides={siteContent.audienceJourney.slides} variant="v1" />
      <ShowcaseMarquee
        eyebrow={siteContent.showcase.eyebrow}
        title={siteContent.showcase.title}
        items={siteContent.showcase.items}
        variant="v1"
      />
      <WhyAtlas />
      <Process />
      <InsightsPreview articles={articles} />
    </>
  );
}
