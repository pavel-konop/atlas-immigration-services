import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { business } from "@/content/config/business";
import { navigation } from "@/content/config/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-atlas-line/80 bg-white/95 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navigation.slice(0, 7).map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-atlas-navy hover:text-atlas-gold">
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
            className="grid h-11 w-11 place-items-center rounded-md border border-atlas-line bg-white text-atlas-navy transition hover:border-atlas-gold hover:text-atlas-gold"
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
