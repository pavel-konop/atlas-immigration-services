import { Bot, Database, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const items: Array<[string, string, LucideIcon]> = [
  ["Content-first", "Services, FAQs, articles, and approved guidance live in editable content files.", Database],
  ["Provider-ready", "The AI provider boundary is isolated so future model integrations do not require a rewrite.", Bot],
  ["Guardrailed", "Future assistants can retrieve approved content and route sensitive questions to a consultant.", ShieldCheck]
];

export function AiReadinessPanel() {
  return (
    <section className="rounded-md border border-atlas-line bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl text-atlas-navy">AI roadmap ready</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map(([title, text, Icon]) => (
          <div key={title as string} className="rounded-md bg-atlas-cream p-4">
            <Icon aria-hidden="true" className="h-6 w-6 text-atlas-gold" />
            <h3 className="mt-3 font-semibold text-atlas-navy">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
