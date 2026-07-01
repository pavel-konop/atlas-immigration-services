"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/content/config/navigation";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const pathname = usePathname();
  const isImmersiveRoute = pathname === "/" || pathname === "/v1" || pathname === "/v2" || pathname === "/about";
  const usesCompactHeader = !pathname.startsWith("/admin");

  return (
    <header
      className={
        usesCompactHeader
          ? `sticky top-0 z-40 bg-[rgba(7,29,58,0.72)] text-white backdrop-blur-md ${isImmersiveRoute ? "-mb-14" : ""}`
          : "sticky top-0 z-40 bg-[#14365e]/95 text-white shadow-[0_8px_30px_rgba(4,18,38,0.12)] backdrop-blur-xl"
      }
    >
      <div className={`container-shell flex items-center justify-between gap-4 ${usesCompactHeader ? "h-14" : "h-20"}`}>
        {usesCompactHeader ? (
          <Link
            href="/"
            aria-label="Atlas home"
            className="shrink-0 font-serif text-xl font-bold uppercase tracking-[0.16em] text-atlas-gold transition hover:text-white"
          >
            ATLAS
          </Link>
        ) : (
          <Logo />
        )}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-white/88 transition hover:text-atlas-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNav compact={usesCompactHeader} />
      </div>
    </header>
  );
}
