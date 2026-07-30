import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
};

/** A bordered surface. Optional header row with title/description + actions. */
export function Card({ title, description, actions, className, bodyClassName, children }: CardProps) {
  const hasHeader = title || description || actions;
  return (
    <section className={cn("rounded-lg border border-atlas-line bg-white shadow-sm", className)}>
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-atlas-line px-5 py-4">
          <div>
            {title && <h2 className="font-serif text-lg text-atlas-navy">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("px-5 py-5", bodyClassName)}>{children}</div>
    </section>
  );
}
