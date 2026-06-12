import { Globe2, Handshake, MessageSquareText, ShieldCheck } from "lucide-react";
import { business } from "@/content/config/business";

const reasons = [
  { title: "Personal Touch", text: "A focused team that takes time to understand your goals.", icon: Handshake },
  { title: "Professional Care", text: "Clear guidance and careful document preparation.", icon: ShieldCheck },
  { title: "Singapore Expertise", text: "Practical local knowledge with an international perspective.", icon: Globe2 },
  { title: "Responsive Support", text: "Direct communication when timing and clarity matter.", icon: MessageSquareText }
];

export function WhyAtlas() {
  return (
    <section className="bg-atlas-navy py-14 text-white">
      <div className="container-shell">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">Why clients choose Atlas</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
              Boutique attention with practical Singapore focus
            </h2>
            <p className="mt-5 leading-8 text-white/72">
              Atlas has supported clients for {business.yearsOperating} years with a team of {business.teamSize}, combining
              personal attention, professional care, and competitive pricing.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <article key={reason.title} className="rounded-md border border-white/15 bg-white/5 p-5">
                  <Icon aria-hidden="true" className="h-7 w-7 text-atlas-gold" />
                  <h3 className="mt-4 font-semibold">{reason.title}</h3>
                  <p className="mt-2 leading-7 text-white/70">{reason.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
