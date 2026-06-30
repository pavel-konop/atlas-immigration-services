import { ContinuousStorySection } from "@/components/sections/ContinuousStorySection";
import { MerlionV4Experience } from "@/components/sections/MerlionV4Experience";
import { ShowcaseMarquee } from "@/components/sections/ShowcaseMarquee";
import { WhyAtlas } from "@/components/sections/WhyAtlas";
import { getSiteContent } from "@/lib/admin/content";

export type HomeVariant = "v1" | "v4";

export async function HomeVariantPage({ variant = "v1" }: { variant?: HomeVariant }) {
  const siteContent = await getSiteContent();

  if (variant === "v4") {
    return <MerlionV4Experience slides={siteContent.audienceJourney.slides} />;
  }

  return (
    <>
      <ContinuousStorySection slides={siteContent.audienceJourney.slides} variant="v1" />
      <WhyAtlas />
      <ShowcaseMarquee
        eyebrow={siteContent.showcase.eyebrow}
        title={siteContent.showcase.title}
        items={siteContent.showcase.items}
      />
    </>
  );
}
