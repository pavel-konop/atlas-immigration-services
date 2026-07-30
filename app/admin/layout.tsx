import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

// Reads the session cookie, so this subtree is always dynamic.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    return <AdminLogin />;
  }
  return <AdminShell>{children}</AdminShell>;
}
