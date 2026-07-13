"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/config/navigation";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const pathname = usePathname();
  const usesCompactHeader = !pathname.startsWith("/admin");
  const topNavigation = navigation.filter((item) => item.href !== "/contact");
  const [showTopBlocks, setShowTopBlocks] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!usesCompactHeader) {
      return;
    }

    const updateHeader = () => {
      const nextY = window.scrollY;
      const isNearTop = nextY < 36;
      const isScrollingUp = nextY < lastScrollY.current - 6;

      setShowTopBlocks(isNearTop || isScrollingUp);
      lastScrollY.current = nextY;
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, [usesCompactHeader]);

  if (usesCompactHeader) {
    const topBlockVisibility = showTopBlocks
      ? "translate-y-0 opacity-100"
      : "pointer-events-none -translate-y-5 opacity-0";

    return (
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-atlas-navy">
        <div
          className={`pointer-events-auto fixed left-[clamp(2.5rem,4vw,5.5rem)] top-6 hidden transition duration-300 ease-out md:block ${topBlockVisibility}`}
        >
          <Link
            href="/"
            aria-label="Atlas home"
            className="block font-serif text-3xl font-bold uppercase tracking-[0.2em] text-atlas-gold drop-shadow-[0_8px_22px_rgba(2,12,28,0.48)] transition hover:text-white"
          >
            ATLAS
          </Link>
        </div>

        <div
          className={`pointer-events-auto fixed right-4 top-4 flex items-center gap-2 transition duration-300 ease-out md:right-7 ${topBlockVisibility}`}
        >
          <nav
            aria-label="Main navigation"
            className="hidden h-12 items-center rounded-md border border-white/50 bg-white/34 px-2 shadow-[0_18px_55px_rgba(2,12,28,0.14)] backdrop-blur-xl md:flex"
          >
            {topNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-full items-center rounded px-4 text-sm font-bold text-atlas-gold drop-shadow-[0_1px_9px_rgba(2,12,28,0.45)] transition hover:bg-white/20 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/contact"
            className="hidden h-12 items-center rounded-md bg-[#171923] px-5 text-sm font-bold text-white shadow-[0_14px_38px_rgba(2,12,28,0.18)] transition hover:bg-atlas-gold hover:text-atlas-navy md:flex"
          >
            Contact
          </Link>
          <div className="rounded-md border border-white/30 bg-[#071d3a]/82 p-1 shadow-[0_18px_55px_rgba(2,12,28,0.22)] backdrop-blur-xl md:hidden">
            <MobileNav compact />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[#14365e]/95 text-white shadow-[0_8px_30px_rgba(4,18,38,0.12)] backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-white/88 transition hover:text-atlas-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
