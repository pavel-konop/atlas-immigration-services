import { BriefcaseBusiness, Building2, UsersRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";

const audiences = [
  {
    title: "For Individuals",
    text: "Work passes, permanent residency, dependant passes, and family immigration support.",
    href: "/services/employment-pass",
    icon: UsersRound
  },
  {
    title: "For Entrepreneurs",
    text: "Company setup and Singapore presence planning for founders and owner-operators.",
    href: "/services/company-incorporation",
    icon: BriefcaseBusiness
  },
  {
    title: "For Businesses",
    text: "Hiring, corporate administration, compliance workflows, and staff mobility support.",
    href: "/services/corporate-compliance",
    icon: Building2
  }
];

export function AudienceCards() {
  return (
    <section className="bg-white py-16">
      <div className="container-shell">
        <div className="mb-8 flex items-center justify-center gap-5">
          <span className="h-px w-24 bg-atlas-line" />
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.22em] text-atlas-navy">Who We Help</h2>
          <span className="h-px w-24 bg-atlas-line" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {audiences.map((audience) => {
            const Icon = audience.icon;
            return (
              <article key={audience.title} className="rounded-md border border-atlas-line bg-white p-6 shadow-sm">
                <Icon aria-hidden="true" className="h-8 w-8 text-atlas-navy" />
                <h3 className="mt-5 text-xl font-semibold text-atlas-navy">{audience.title}</h3>
                <p className="mt-3 min-h-20 leading-7 text-slate-600">{audience.text}</p>
                <ButtonLink href={audience.href} variant="ghost" className="mt-4 px-0">
                  Learn more
                </ButtonLink>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
