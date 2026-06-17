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
  variant?: "v1" | "v2" | "v3";
}) {
  const enabledItems = items.filter((item) => item.enabled);
  if (enabledItems.length === 0) return null;
  const rail = [...enabledItems, ...enabledItems];
  const layered = variant !== "v1";

  return (
    <section
      data-atlas-showcase-marquee="true"
      data-atlas-showcase-variant={variant}
      className={layered ? "overflow-hidden bg-[#eef3f7] py-18" : "overflow-hidden bg-white py-18"}
    >
      <div className="container-shell mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{eyebrow}</p>
        <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-atlas-navy md:text-5xl">{title}</h2>
      </div>
      <div className="relative">
        <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r ${layered ? "from-[#eef3f7]" : "from-white"} to-transparent`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l ${layered ? "from-[#eef3f7]" : "from-white"} to-transparent`} />
        <div className={layered ? "flex w-max animate-showcase-marquee items-start gap-8" : "flex w-max animate-showcase-marquee gap-8"}>
          {rail.map((item, index) => {
            const height = index % 3 === 1 ? "md:h-[430px]" : index % 3 === 2 ? "md:h-[320px]" : "md:h-[365px]";
            const offset = index % 3 === 1 ? "md:mt-1" : index % 3 === 2 ? "md:mt-24" : "md:mt-14";

            if (layered && item.type === "photo") {
              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={item.href}
                  className={`group relative h-[330px] w-[78vw] max-w-[560px] shrink-0 overflow-hidden rounded-md border border-white bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(7,29,58,0.2)] md:w-[500px] ${height} ${offset}`}
                >
                  <Image src={item.image} alt={item.title} fill sizes="560px" className="object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-atlas-navy/26 via-transparent to-transparent" />
                </Link>
              );
            }

            if (layered && item.type === "feedback") {
              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={item.href}
                  className={`group flex h-[300px] w-[78vw] max-w-[520px] shrink-0 flex-col justify-between rounded-md border border-white/12 bg-atlas-navy p-8 text-white shadow-soft transition hover:-translate-y-1 hover:border-atlas-gold md:w-[470px] ${index % 2 === 0 ? "md:mt-20" : "md:mt-8"}`}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{item.type}</span>
                  <span className="block font-serif text-3xl leading-tight">{item.title}</span>
                  <span className="block text-lg leading-8 text-white/74">
                    <span aria-hidden="true">&ldquo;</span>
                    {item.context}
                    <span aria-hidden="true">&rdquo;</span>
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={`${item.id}-${index}`}
                href={item.href}
                className={`group grid w-[76vw] max-w-[620px] shrink-0 gap-4 rounded-md border border-atlas-line bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-atlas-gold hover:shadow-soft md:w-[520px] ${layered ? `${height} ${offset}` : ""}`}
              >
                <span className="relative block aspect-[16/9] overflow-hidden rounded-md bg-atlas-mist">
                  <Image src={item.image} alt="" fill sizes="520px" className="object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="px-2 pb-3">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-atlas-gold">{item.type}</span>
                  <span className="mt-2 block text-xl font-semibold text-atlas-navy">{item.title}</span>
                  <span className="mt-2 block leading-7 text-slate-600">{item.context}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
