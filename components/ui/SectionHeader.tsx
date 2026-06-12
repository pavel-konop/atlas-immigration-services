import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, description, align = "left" }: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-atlas-gold">{eyebrow}</p>
      ) : null}
      <h2 className="font-serif text-3xl leading-tight text-atlas-navy md:text-5xl">{title}</h2>
      {description ? <div className="mt-4 text-base leading-8 text-slate-600 md:text-lg">{description}</div> : null}
    </div>
  );
}
