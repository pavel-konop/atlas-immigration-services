import type { Metadata } from "next";
import { getEditableFaqs, getSiteContent } from "@/lib/admin/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { FAQList } from "@/components/ui/FAQList";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Common questions about Atlas Immigration Services and Singapore immigration or corporate support.",
  path: "/faq"
});

export default async function FAQPage() {
  const siteContent = await getSiteContent();
  const faqs = getEditableFaqs(siteContent);

  return (
    <section className="bg-atlas-cream py-18">
      <div className="container-shell max-w-4xl">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions clients ask before getting started"
          description="These answers are general guidance. A consultant can review your specific facts and timing."
          align="center"
        />
        <div className="mt-10">
          <FAQList items={faqs} />
        </div>
      </div>
    </section>
  );
}
export const dynamic = "force-dynamic";
