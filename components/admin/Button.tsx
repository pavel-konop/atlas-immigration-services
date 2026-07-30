import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs",
  md: "min-h-11 px-4 py-2.5 text-sm"
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-atlas-navy text-white hover:bg-atlas-blue",
  secondary: "border border-atlas-line bg-white text-atlas-navy hover:border-atlas-gold hover:text-atlas-blue",
  ghost: "text-atlas-blue hover:bg-atlas-mist hover:text-atlas-navy",
  danger: "border border-red-200 bg-white text-red-600 hover:border-red-400 hover:bg-red-50"
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
  };

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {loading && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

/** Same visual language as Button, rendered as a link. */
export function AdminButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children
}: ButtonLinkProps) {
  const classes = cn(base, sizes[size], variants[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
