import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/content/services";

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-md border border-atlas-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-atlas-gold hover:shadow-soft"
    >
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-atlas-line bg-atlas-mist text-atlas-navy">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{service.category}</span>
      <h3 className="mt-3 text-xl font-semibold text-atlas-navy">{service.title}</h3>
      <p className="mt-3 flex-1 leading-7 text-slate-600">{service.summary}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-atlas-navy">
        Explore <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
