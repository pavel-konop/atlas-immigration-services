"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides marketing chrome (Header/Footer) on the /admin area, which has its own
 * shell. The children are server-rendered and passed through; this wrapper only
 * decides whether to display them based on the current path.
 */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
