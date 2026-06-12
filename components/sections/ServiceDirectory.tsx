import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { services } from "@/content/services";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ServiceDirectory() {
  const categories = ["Immigration Services", "Corporate Services"] as const;

  return (
    <section className="bg-atlas-cream py-18">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Core Services"
          title="Choose the right path for your goals"
          description="Focused Singapore support for personal, family, founder, and employer needs."
          align="center"
        />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="rounded-md border border-atlas-line bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-atlas-navy">{category}</h3>
              <div className="grid gap-3">
                {services
                  .filter((service) => service.category === category)
                  .map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="group flex items-center gap-3 rounded-md border border-atlas-line px-4 py-3 transition hover:border-atlas-gold hover:bg-atlas-cream"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-atlas-mist text-atlas-navy">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="font-semibold text-atlas-navy">{service.title}</span>
                        <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 text-atlas-gold transition group-hover:translate-x-1" />
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
