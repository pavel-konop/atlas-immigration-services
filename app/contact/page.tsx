import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { business } from "@/content/config/business";
import { pageMetadata } from "@/lib/seo/metadata";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contact Atlas Immigration Services for Singapore immigration and corporate services guidance.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <section className="bg-atlas-cream py-18">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeader
            eyebrow="Contact"
            title="Speak with Atlas about your Singapore plans"
            description="Share a short note and the team will follow up with practical next steps."
          />
          <div className="mt-8 grid gap-4 rounded-md border border-atlas-line bg-white p-6">
            <ContactLine icon={Phone} label="Phone" value={business.phoneDisplay} href={business.phoneHref} />
            <ContactLine icon={MessageCircle} label="WhatsApp" value={business.phoneDisplay} href={business.whatsappHref} />
            <ContactLine icon={Mail} label="Email" value={business.email} href={`mailto:${business.email}`} />
            <ContactLine icon={MapPin} label="Registered address" value={business.registeredAddress} />
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
  href
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <span>
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{label}</span>
      <span className="mt-1 block text-atlas-navy">{value}</span>
    </span>
  );

  return (
    <div className="flex gap-3">
      <Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-atlas-gold" />
      {href ? <a href={href}>{content}</a> : content}
    </div>
  );
}
