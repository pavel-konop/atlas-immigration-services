"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navigation } from "@/content/config/navigation";
import { business } from "@/content/config/business";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function MobileNav({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid h-11 w-11 place-items-center rounded-md border border-white/22 bg-white/5 text-white"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
      </button>
      {open ? (
        <div className={`absolute inset-x-4 z-50 rounded-md border border-white/12 bg-atlas-navy p-4 text-white shadow-soft ${compact ? "top-14" : "top-20"}`}>
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <ButtonLink href="/contact">Speak with a Consultant</ButtonLink>
            <a
              href={business.whatsappHref}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/24 px-4 text-sm font-semibold text-white"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
