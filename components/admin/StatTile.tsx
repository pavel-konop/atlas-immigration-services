import type { ReactNode } from "react";

/** Compact metric tile: label + large value + optional sub-line. No charts. */
export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-lg border border-atlas-line bg-white px-4 py-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-serif text-2xl text-atlas-navy">{value}</p>
      {sub != null && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
