import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/auth";
import type { NavItem } from "@/components/nav-tabs";
import type { Role } from "@/lib/types";

export type AdminSection =
  | "access"
  | "announcements"
  | "compliance"
  | "dashboard"
  | "documents"
  | "hero"
  | "incidents"
  | "preview"
  | "programme"
  | "sponsors"
  | "stands"
  | "users"
  | "vendors";

export const adminAccessRoles: Role[] = [
  "admin",
  "super_admin",
  "operations_manager",
  "content_manager",
  "compliance_manager",
  "stand_manager",
];

export const adminNavItems: Array<NavItem & { section: AdminSection }> = [
  { href: "/admin", label: "Dashboard", section: "dashboard" },
  { href: "/admin/users", label: "Users", section: "users" },
  { href: "/admin/preview", label: "Preview", section: "preview" },
  { href: "/admin/hero", label: "Hero", section: "hero" },
  { href: "/admin/access-requests", label: "Access", section: "access" },
  { href: "/admin/vendors", label: "Vendors", section: "vendors" },
  { href: "/admin/sponsors", label: "Sponsors", section: "sponsors" },
  { href: "/admin/incidents", label: "Incidents", section: "incidents" },
  { href: "/admin/documents", label: "Documents", section: "documents" },
  { href: "/admin/compliance", label: "Compliance", section: "compliance" },
  { href: "/admin/stands", label: "Stands", section: "stands" },
  { href: "/admin/programme", label: "Programme", section: "programme" },
  { href: "/admin/announcements", label: "Announcements", section: "announcements" },
];

const allAdminSections = adminNavItems.map((item) => item.section);

const adminSectionPermissions: Record<Role, AdminSection[]> = {
  admin: allAdminSections,
  super_admin: allAdminSections,
  operations_manager: ["dashboard", "access", "vendors", "sponsors", "incidents", "stands"],
  content_manager: ["dashboard", "hero", "programme", "announcements"],
  compliance_manager: ["dashboard", "documents", "compliance"],
  stand_manager: ["dashboard", "stands"],
  partner: [],
  sponsor: [],
  vendor: [],
  visitor: [],
};

export function canAccessAdminSection(role: Role, section: AdminSection) {
  return adminSectionPermissions[role]?.includes(section) ?? false;
}

export function getAdminNavItems(role: Role | null | undefined): NavItem[] {
  if (!role) {
    return [];
  }

  return adminNavItems
    .filter((item) => canAccessAdminSection(role, item.section))
    .map(({ href, label }) => ({ href, label }));
}

export async function requireAdminSection(section: AdminSection) {
  const session = await requireAnyRole(adminAccessRoles);

  if (!canAccessAdminSection(session.role, section)) {
    redirect("/unauthorized");
  }

  return session;
}
