import { ContinuousStorySection } from "@/components/sections/ContinuousStorySection";
import { ShowcaseMarquee } from "@/components/sections/ShowcaseMarquee";
import { WhyAtlas } from "@/components/sections/WhyAtlas";
import { getHomepageShowcaseItems, getSiteContent } from "@/lib/admin/content";

export type HomeVariant = "v1" | "v2";

export async function HomeVariantPage({ variant = "v1" }: { variant?: HomeVariant }) {
  const siteContent = await getSiteContent();
  const showcaseItems = getHomepageShowcaseItems(siteContent);

  return (
    <>
      <ContinuousStorySection slides={siteContent.audienceJourney.slides} variant={variant} />
      <WhyAtlas />
      <ShowcaseMarquee
        eyebrow={siteContent.showcase.eyebrow}
        title={siteContent.showcase.title}
        items={showcaseItems}
        variant={variant}
      />
    </>
  );
}
