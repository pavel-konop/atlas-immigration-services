import Image from "next/image";
import Link from "next/link";
import type { ShowcaseItem } from "@/types/admin-content";

export function ShowcaseMarquee({
  eyebrow,
  title,
  items,
  variant = "v1"
}: {
  eyebrow: string;
  title: string;
  items: ShowcaseItem[];
  variant?: "v1" | "v2";
}) {
  const enabledItems = items.filter((item) => item.enabled);
  if (enabledItems.length === 0) return null;
  const firstRail = [...enabledItems, ...enabledItems, ...enabledItems];
  const secondRailSeed = [...enabledItems].reverse();
  const secondRail = [...secondRailSeed, ...secondRailSeed, ...secondRailSeed];

  return (
    <section
      data-atlas-showcase-marquee="true"
      data-atlas-showcase-variant={variant}
      className="overflow-hidden bg-[#071d3a] py-18 text-white"
    >
      <div className="container-shell mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{eyebrow}</p>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-white md:text-5xl">{title}</h2>
      </div>
      <div className="relative space-y-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#071d3a] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#071d3a] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-white/10" />
        <div className="flex w-max animate-showcase-marquee-slow items-start gap-7">
          {firstRail.map((item, index) => (
            <ShowcaseTile key={`top-${item.id}-${index}`} item={item} index={index} level="top" />
          ))}
        </div>
        <div className="flex w-max animate-showcase-marquee-reverse items-start gap-7 pl-28">
          {secondRail.map((item, index) => (
            <ShowcaseTile key={`bottom-${item.id}-${index}`} item={item} index={index} level="bottom" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseTile({ item, index, level }: { item: ShowcaseItem; index: number; level: "top" | "bottom" }) {
  const offset = level === "top" ? (index % 2 === 0 ? "md:mt-0" : "md:mt-10") : index % 2 === 0 ? "md:mt-6" : "md:mt-0";

  if (item.type === "photo") {
    return (
      <Link
        href={item.href}
        className={`group relative h-[260px] w-[72vw] max-w-[520px] shrink-0 overflow-hidden rounded-md border border-white/14 bg-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-atlas-gold md:w-[460px] ${offset}`}
      >
        <Image src={item.image} alt={item.title} fill sizes="520px" className="object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,29,58,0.02)_20%,rgba(7,29,58,0.62)_100%)]" />
        <span className="absolute bottom-5 left-5 right-5">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">Photo</span>
          <span className="mt-2 block text-xl font-semibold text-white">{item.title}</span>
        </span>
      </Link>
    );
  }

  if (item.type === "feedback") {
    return (
      <Link
        href={item.href}
        className={`group flex h-[250px] w-[72vw] max-w-[500px] shrink-0 flex-col justify-between rounded-md border border-cyan-200/18 bg-[#0d2c52] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-atlas-gold md:w-[430px] ${offset}`}
      >
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">Feedback</span>
        <span className="block font-serif text-3xl leading-tight text-white">{item.title}</span>
        <span className="block text-base leading-7 text-white/72">
          <span aria-hidden="true">&ldquo;</span>
          {item.context}
          <span aria-hidden="true">&rdquo;</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group grid w-[76vw] max-w-[610px] shrink-0 gap-4 rounded-md border border-white/16 bg-[#0b294d] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-atlas-gold md:w-[520px] ${offset}`}
    >
      <span className="relative block aspect-[16/9] overflow-hidden rounded-md bg-white/10">
        <Image src={item.image} alt="" fill sizes="520px" className="object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#071d3a]/24 via-transparent to-transparent" />
      </span>
      <span className="px-2 pb-3">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">Article</span>
        <span className="mt-2 block text-xl font-semibold text-white">{item.title}</span>
        <span className="mt-2 block leading-7 text-white/70">{item.context}</span>
      </span>
    </Link>
  );
}
