"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { business } from "@/content/config/business";
import { navigation } from "@/content/config/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const pathname = usePathname();
  const usesOverlayHeader = pathname === "/" || pathname === "/v1" || pathname === "/v4";

  return (
    <header className={usesOverlayHeader ? "sticky top-0 z-40 -mb-14 bg-[rgba(7,29,58,0.64)] text-white backdrop-blur-md" : "sticky top-0 z-40 bg-[#14365e]/95 text-white shadow-[0_8px_30px_rgba(4,18,38,0.12)] backdrop-blur-xl"}>
      <div className={`container-shell flex items-center justify-between gap-4 ${usesOverlayHeader ? "h-14" : "h-20"}`}>
        {usesOverlayHeader ? null : <Logo />}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navigation.slice(0, 7).map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-white/88 transition hover:text-atlas-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink href="/contact" className="px-4">
            Speak with a Consultant
          </ButtonLink>
          <a
            href={business.whatsappHref}
            aria-label="Contact Atlas on WhatsApp"
            className="grid h-11 w-11 place-items-center rounded-md border border-white/22 bg-white/5 text-white transition hover:border-atlas-gold hover:text-atlas-gold"
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>
        <MobileNav compact={usesOverlayHeader} />
      </div>
    </header>
  );
}
