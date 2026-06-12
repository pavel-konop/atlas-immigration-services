import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { business } from "@/content/config/business";
import { services } from "@/content/services";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  const immigration = services.filter((service) => service.category === "Immigration Services").slice(0, 4);
  const corporate = services.filter((service) => service.category === "Corporate Services").slice(0, 4);

  return (
    <footer className="bg-white">
      <div className="bg-atlas-navy py-10 text-white">
        <div className="container-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-serif text-3xl">Ready to explore your options in Singapore?</p>
            <p className="mt-2 max-w-2xl text-white/74">Speak with Atlas for personal, practical guidance.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-md bg-atlas-gold px-5 py-3 text-sm font-semibold text-atlas-navy hover:bg-atlas-amber"
            >
              Speak with a Consultant
            </Link>
            <a
              href={business.whatsappHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:border-atlas-gold"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm leading-7 text-slate-600">
            Singapore-based immigration and corporate services consultancy serving individuals, entrepreneurs, and
            businesses.
          </p>
        </div>
        <FooterColumn title="Immigration">
          {immigration.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`}>{service.title}</Link>
          ))}
          <Link href="/services">All services</Link>
        </FooterColumn>
        <FooterColumn title="Corporate">
          {corporate.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`}>{service.title}</Link>
          ))}
          <Link href="/about">About Atlas</Link>
        </FooterColumn>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-atlas-navy">Contact</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
            <li className="flex gap-3">
              <Phone aria-hidden="true" className="mt-1 h-4 w-4 text-atlas-gold" />
              <a href={business.phoneHref}>{business.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <Mail aria-hidden="true" className="mt-1 h-4 w-4 text-atlas-gold" />
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
            <li className="flex gap-3">
              <MapPin aria-hidden="true" className="mt-1 h-4 w-4 text-atlas-gold" />
              <span>{business.registeredAddress}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-atlas-line py-5">
        <div className="container-shell flex flex-col justify-between gap-3 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-atlas-navy">{title}</h2>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">{children}</div>
    </div>
  );
}
