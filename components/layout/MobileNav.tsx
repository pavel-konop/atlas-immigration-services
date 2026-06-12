"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navigation } from "@/content/config/navigation";
import { business } from "@/content/config/business";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid h-11 w-11 place-items-center rounded-md border border-atlas-line bg-white text-atlas-navy"
      >
        {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
      </button>
      {open ? (
        <div className="absolute inset-x-4 top-20 z-50 rounded-md border border-atlas-line bg-white p-4 shadow-soft">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-atlas-navy hover:bg-atlas-mist"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <ButtonLink href="/contact">Speak with a Consultant</ButtonLink>
            <a
              href={business.whatsappHref}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-atlas-line px-4 text-sm font-semibold text-atlas-navy"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
