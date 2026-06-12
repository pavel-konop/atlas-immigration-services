import { AudienceCards } from "@/components/sections/AudienceCards";
import { Hero } from "@/components/sections/Hero";
import { InsightsPreview } from "@/components/sections/InsightsPreview";
import { Process } from "@/components/sections/Process";
import { RouteMapSection } from "@/components/sections/RouteMapSection";
import { ServiceDirectory } from "@/components/sections/ServiceDirectory";
import { WhyAtlas } from "@/components/sections/WhyAtlas";
import { FAQList } from "@/components/ui/FAQList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { faqs } from "@/content/faqs";
import { getFeaturedArticles } from "@/lib/content/articles";

export default async function HomePage() {
  const articles = await getFeaturedArticles(3);

  return (
    <>
      <Hero />
      <AudienceCards />
      <RouteMapSection />
      <ServiceDirectory />
      <WhyAtlas />
      <Process />
      <section className="bg-atlas-cream py-18">
        <div className="container-shell grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <SectionHeader
            eyebrow="Frequently Asked Questions"
            title="Clear answers before the first call"
            description="A few common questions clients ask when planning Singapore immigration or company support."
          />
          <FAQList items={faqs.slice(0, 4)} />
        </div>
      </section>
      <InsightsPreview articles={articles} />
    </>
  );
}
