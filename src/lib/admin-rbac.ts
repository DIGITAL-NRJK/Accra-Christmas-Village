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
  { href: "/admin/documents", label: "Documents", section: "documents" },
  { href: "/admin/stands", label: "Stands", section: "stands" },
  { href: "/admin/programme", label: "Programme", section: "programme" },
  { href: "/admin/announcements", label: "Announcements", section: "announcements" },
];

const superAdminSections = adminNavItems
  .map((item) => item.section)
  .concat("compliance") as AdminSection[];
const adminSections = superAdminSections.filter((section) => section !== "users");

const adminSectionPermissions: Record<Role, AdminSection[]> = {
  admin: adminSections,
  super_admin: superAdminSections,
  operations_manager: ["dashboard", "preview", "access", "vendors", "sponsors", "stands"],
  content_manager: ["dashboard", "preview", "hero", "programme", "announcements"],
  compliance_manager: ["dashboard", "preview", "access", "vendors", "sponsors", "documents", "compliance"],
  stand_manager: ["dashboard", "preview", "vendors", "sponsors", "stands"],
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
