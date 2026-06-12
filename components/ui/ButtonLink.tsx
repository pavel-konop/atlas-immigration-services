import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-atlas-gold text-atlas-navy shadow-gold hover:bg-atlas-amber focus-visible:outline-atlas-gold",
        variant === "secondary" &&
          "border border-atlas-line bg-white text-atlas-navy hover:border-atlas-gold hover:text-atlas-blue",
        variant === "ghost" && "text-atlas-navy hover:text-atlas-gold",
        className
      )}
    >
      {children}
    </Link>
  );
}
