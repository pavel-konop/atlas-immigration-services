import { BookOpen, FileText, LayoutDashboard, MessagesSquare, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
};

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Chats", href: "/admin/chats", icon: MessagesSquare, soon: true },
  { label: "Knowledge", href: "/admin/knowledge", icon: BookOpen, soon: true }
];

/** Active when the path equals the item or is nested under it (but /admin is exact). */
export function isNavItemActive(itemHref: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (itemHref === "/admin") return pathname === "/admin";
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}
