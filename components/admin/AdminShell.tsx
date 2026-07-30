"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { business } from "@/content/config/business";
import { cn } from "@/lib/utils/cn";
import { adminNav, isNavItemActive } from "./nav";
import { AdminToastProvider } from "./toast";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.refresh(); // server layout re-checks the cookie → renders login
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-atlas-navy text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-atlas-gold font-serif text-sm font-bold text-atlas-navy">
          A
        </span>
        <span className="font-serif text-lg leading-none">Atlas Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {adminNav.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon aria-hidden="true" className={cn("h-[18px] w-[18px]", active && "text-atlas-gold")} />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/60">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut aria-hidden="true" className="h-[18px] w-[18px]" />
          Log out
        </button>
        <p className="mt-2 px-3 text-xs text-white/40">{business.shortName}</p>
      </div>
    </div>
  );

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#f5f7fa] lg:grid lg:grid-cols-[15rem_1fr]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-atlas-line bg-atlas-navy px-4 py-3 text-white lg:hidden">
          <span className="flex items-center gap-2 font-serif text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-atlas-gold text-xs font-bold text-atlas-navy">
              A
            </span>
            Atlas Admin
          </span>
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation" className="p-1.5">
            <Menu aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-64 shadow-soft">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 z-10 p-1 text-white/70 hover:text-white"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        {/* Content area */}
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </AdminToastProvider>
  );
}
