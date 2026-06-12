import type { Metadata } from "next";
import { faqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo/metadata";
import { FAQList } from "@/components/ui/FAQList";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Common questions about Atlas Immigration Services and Singapore immigration or corporate support.",
  path: "/faq"
});

export default function FAQPage() {
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
