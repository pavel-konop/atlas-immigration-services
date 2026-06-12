import type { Metadata } from "next";
import { business } from "@/content/config/business";
import { pageMetadata } from "@/lib/seo/metadata";
import { AiReadinessPanel } from "@/components/ai/AiReadinessPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "Learn about Atlas Immigration Services Pte Ltd and its Singapore-focused consulting approach.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <>
      <section className="bg-atlas-navy py-18 text-white">
        <div className="container-shell max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">About Atlas</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            Personal immigration and corporate guidance from Singapore
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/74">
            Atlas Immigration Services Pte Ltd is a Singapore-based consultancy led by Bernie, Chief Consultant. The
            team supports individuals, families, entrepreneurs, and employers with practical next steps.
          </p>
        </div>
      </section>
      <section className="bg-white py-18">
        <div className="container-shell grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
          <SectionHeader
            eyebrow="Approach"
            title="Professional care without losing the human conversation"
            description="Clients come to Atlas for personal attention, responsive communication, competitive pricing, and Singapore-focused support."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {business.differentiators.map((item) => (
              <div key={item} className="rounded-md border border-atlas-line bg-atlas-cream p-5 font-semibold text-atlas-navy">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-atlas-cream py-18">
        <div className="container-shell">
          <AiReadinessPanel />
        </div>
      </section>
    </>
  );
}
