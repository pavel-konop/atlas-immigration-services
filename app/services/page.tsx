import type { Metadata } from "next";
import { services } from "@/content/services";
import { pageMetadata } from "@/lib/seo/metadata";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ServiceCard } from "@/components/ui/ServiceCard";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: "Singapore immigration and corporate services for individuals, entrepreneurs, and businesses.",
  path: "/services"
});

export default function ServicesPage() {
  return (
    <section className="bg-atlas-cream py-18">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Services"
          title="Singapore-focused support for each step"
          description="Choose a service area to understand the likely process, documents, and next steps."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
