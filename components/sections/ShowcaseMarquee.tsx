import Image from "next/image";
import Link from "next/link";
import type { ShowcaseItem } from "@/types/admin-content";

export function ShowcaseMarquee({
  eyebrow,
  title,
  items
}: {
  eyebrow: string;
  title: string;
  items: ShowcaseItem[];
}) {
  const enabledItems = items.filter((item) => item.enabled);
  if (enabledItems.length === 0) return null;
  const rail = [...enabledItems, ...enabledItems];

  return (
    <section
      data-atlas-showcase-marquee="true"
      className="overflow-hidden bg-[#071d3a] py-18 text-white"
    >
      <div className="container-shell mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{eyebrow}</p>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-white md:text-5xl">{title}</h2>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#071d3a] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#071d3a] to-transparent" />
        <div className="flex w-max animate-showcase-marquee gap-8">
          {rail.map((item, index) => {
            return (
              <Link
                key={`${item.id}-${index}`}
                href={item.href}
                className="group grid w-[76vw] max-w-[620px] shrink-0 gap-4 rounded-md border border-white/14 bg-[#0b294d] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-atlas-gold md:w-[520px]"
              >
                <span className="relative block aspect-[16/9] overflow-hidden rounded-md bg-white/10">
                  <Image src={item.image} alt="" fill sizes="520px" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#071d3a]/24 via-transparent to-transparent" />
                </span>
                <span className="px-2 pb-3">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{item.type}</span>
                  <span className="mt-2 block text-xl font-semibold text-white">{item.title}</span>
                  <span className="mt-2 block leading-7 text-white/70">{item.context}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
