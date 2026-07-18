import { redirect } from "next/navigation";
import { requireAnyRole } from "@/lib/auth";
import type { NavItem } from "@/components/nav-tabs";
import type { Role } from "@/lib/types";

export type AdminSection =
  | "access"
  | "accreditations"
  | "announcements"
  | "analytics"
  | "audit"
  | "compliance"
  | "check_in"
  | "dashboard"
  | "documents"
  | "hero"
  | "incidents"
  | "notifications"
  | "preview"
  | "programme"
  | "reports"
  | "sponsors"
  | "sponsor_delivery"
  | "stands"
  | "tasks"
  | "tickets"
  | "users"
  | "vendor_catalog"
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
  { href: "/admin/audit-logs", label: "Audit log", section: "audit" },
  { href: "/admin/analytics", label: "Analytics", section: "analytics" },
  { href: "/admin/users", label: "Users", section: "users" },
  { href: "/admin/preview", label: "Preview", section: "preview" },
  { href: "/admin/hero", label: "Hero", section: "hero" },
  { href: "/admin/access-requests", label: "Access", section: "access" },
  { href: "/admin/accreditations", label: "Badges", section: "accreditations" },
  { href: "/admin/check-in", label: "Check-in", section: "check_in" },
  { href: "/admin/vendors", label: "Vendors", section: "vendors" },
  { href: "/admin/vendor-catalog", label: "Vendor catalog", section: "vendor_catalog" },
  { href: "/admin/sponsors", label: "Sponsors", section: "sponsors" },
  { href: "/admin/sponsor-deliverables", label: "Sponsor delivery", section: "sponsor_delivery" },
  { href: "/admin/incidents", label: "Incidents", section: "incidents" },
  { href: "/admin/notifications", label: "Notifications", section: "notifications" },
  { href: "/admin/tickets", label: "Support", section: "tickets" },
  { href: "/admin/documents", label: "Documents", section: "documents" },
  { href: "/admin/compliance", label: "Compliance", section: "compliance" },
  { href: "/admin/stands", label: "Stands", section: "stands" },
  { href: "/admin/tasks", label: "Tasks", section: "tasks" },
  { href: "/admin/programme", label: "Programme", section: "programme" },
  { href: "/admin/reports", label: "Reports", section: "reports" },
  { href: "/admin/announcements", label: "Announcements", section: "announcements" },
];

const allAdminSections = adminNavItems.map((item) => item.section);

const adminSectionPermissions: Record<Role, AdminSection[]> = {
  admin: allAdminSections,
  super_admin: allAdminSections,
  operations_manager: ["dashboard", "access", "accreditations", "check_in", "vendors", "vendor_catalog", "sponsors", "sponsor_delivery", "incidents", "notifications", "tickets", "stands", "tasks", "analytics", "reports"],
  content_manager: ["dashboard", "hero", "programme", "announcements", "notifications", "analytics", "sponsor_delivery", "reports"],
  compliance_manager: ["dashboard", "documents", "compliance", "notifications", "tickets", "reports"],
  stand_manager: ["dashboard", "check_in", "stands", "tasks", "reports"],
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
