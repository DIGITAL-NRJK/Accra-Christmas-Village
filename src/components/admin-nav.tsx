import { NavTabs } from "@/components/nav-tabs";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/preview", label: "Preview" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/access-requests", label: "Access" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/stands", label: "Stands" },
  { href: "/admin/programme", label: "Programme" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/compliance", label: "Compliance" },
];

export function AdminNav({ activeHref }: { activeHref: string }) {
  return <NavTabs activeHref={activeHref} items={adminNav} />;
}
