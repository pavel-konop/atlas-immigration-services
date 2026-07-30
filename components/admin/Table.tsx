import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Compositional table primitives (used by upcoming pages like chat transcripts).
 * Wrap in a horizontally scrollable container so wide tables never break layout.
 */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-atlas-line bg-white">
      <table className={cn("w-full min-w-[32rem] border-collapse text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-atlas-mist/60 text-left text-xs uppercase tracking-wide text-slate-500">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-atlas-line">{children}</tbody>;
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={className}>{children}</tr>;
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-2.5 font-semibold", className)}>{children}</th>;
}

export function TD({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-top text-atlas-ink", className)}>{children}</td>;
}
