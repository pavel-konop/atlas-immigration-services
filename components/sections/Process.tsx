const steps = [
  ["01", "Consultation", "We discuss your goals, timing, and current situation."],
  ["02", "Assessment", "Atlas reviews the relevant requirements and practical next steps."],
  ["03", "Preparation", "We guide document collection and application or filing preparation."],
  ["04", "Ongoing Support", "The team stays available for follow-up and future needs."]
];

export function Process() {
  return (
    <section className="bg-white py-18">
      <div className="container-shell">
        <h2 className="text-center text-sm font-bold uppercase tracking-[0.22em] text-atlas-navy">Your journey, our guidance</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <article key={title} className="relative rounded-md border border-atlas-line bg-white p-6 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-atlas-cream text-sm font-bold text-atlas-gold">{number}</span>
              <h3 className="mt-5 text-lg font-semibold text-atlas-navy">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
