import { faqs, type FAQ } from "@/content/faqs";

type FAQListProps = {
  items?: FAQ[];
};

export function FAQList({ items = faqs }: FAQListProps) {
  return (
    <div className="divide-y divide-atlas-line rounded-md border border-atlas-line bg-white">
      {items.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-atlas-navy">
            <span>{faq.question}</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-atlas-line text-atlas-gold transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="px-5 pb-5 leading-7 text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
