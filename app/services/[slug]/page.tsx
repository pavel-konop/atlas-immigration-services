import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getService, services } from "@/content/services";
import { pageMetadata } from "@/lib/seo/metadata";
import type { RouteParams } from "@/types/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ServiceCard } from "@/components/ui/ServiceCard";

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: RouteParams<"slug">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) return {};

  return pageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`
  });
}

export default async function ServiceDetailPage({ params }: RouteParams<"slug">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const Icon = service.icon;
  const related = services.filter((item) => item.slug !== service.slug && item.category === service.category).slice(0, 3);

  return (
    <>
      <section className="bg-atlas-navy py-14 text-white">
        <div className="container-shell">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-atlas-gold">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All services
          </Link>
          <div className="mt-8 grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-center">
            <div className="grid h-24 w-24 place-items-center rounded-md border border-white/20 bg-white/8 text-atlas-gold">
              <Icon aria-hidden="true" className="h-11 w-11" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{service.category}</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{service.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/74">{service.description}</p>
              <ButtonLink href="/contact" className="mt-8">Discuss this service</ButtonLink>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-18">
        <div className="container-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-serif text-3xl text-atlas-navy">What Atlas helps you achieve</h2>
            <div className="mt-6 grid gap-4">
              {service.outcomes.map((item) => (
                <div key={item} className="flex gap-3 rounded-md border border-atlas-line bg-white p-4">
                  <CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-atlas-gold" />
                  <p className="leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-md border border-atlas-line bg-atlas-cream p-6">
            <h2 className="font-serif text-2xl text-atlas-navy">Typical documents</h2>
            <ul className="mt-5 grid gap-3">
              {service.documents.map((item) => (
                <li key={item} className="rounded-md bg-white px-4 py-3 text-slate-700">{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
      <section className="bg-atlas-cream py-18">
        <div className="container-shell">
          <h2 className="font-serif text-3xl text-atlas-navy">How the process works</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-5">
            {service.process.map((step, index) => (
              <article key={step} className="rounded-md border border-atlas-line bg-white p-5">
                <span className="text-sm font-bold text-atlas-gold">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-semibold text-atlas-navy">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-18">
        <div className="container-shell">
          <h2 className="font-serif text-3xl text-atlas-navy">Related services</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <ServiceCard key={item.slug} service={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
