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
  | "vendor_applications"
  | "vendor_catalog"
  | "vendor_branding"
  | "vendor_handbook"
  | "vendor_payments"
  | "vendors";

export const adminAccessRoles: Role[] = [
  "admin",
  "super_admin",
  "operations_manager",
  "content_manager",
  "compliance_manager",
  "stand_manager",
];

type AdminNavItem = NavItem & { section: AdminSection };

export type AdminNavGroup = {
  id: "overview" | "people" | "partners" | "operations" | "content";
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", section: "dashboard" },
      { href: "/admin/analytics", label: "Analytics", section: "analytics" },
      { href: "/admin/reports", label: "Reports", section: "reports" },
      { href: "/admin/audit-logs", label: "Audit log", section: "audit" },
    ],
  },
  {
    id: "people",
    label: "People & access",
    items: [
      { href: "/admin/users", label: "Users", section: "users" },
      { href: "/admin/access-requests", label: "Access", section: "access" },
      { href: "/admin/accreditations", label: "Badges", section: "accreditations" },
      { href: "/admin/check-in", label: "Check-in", section: "check_in" },
    ],
  },
  {
    id: "partners",
    label: "Vendors & sponsors",
    items: [
      { href: "/admin/vendors", label: "Vendors", section: "vendors" },
      { href: "/admin/vendor-applications", label: "Vendor applications", section: "vendor_applications" },
      { href: "/admin/vendor-catalog", label: "Vendor catalog", section: "vendor_catalog" },
      { href: "/admin/vendor-payments", label: "Vendor payments", section: "vendor_payments" },
      { href: "/admin/vendor-branding", label: "Vendor branding", section: "vendor_branding" },
      { href: "/admin/vendor-handbook", label: "Vendor handbook", section: "vendor_handbook" },
      { href: "/admin/sponsors", label: "Sponsors", section: "sponsors" },
      { href: "/admin/sponsor-deliverables", label: "Sponsor delivery", section: "sponsor_delivery" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin/incidents", label: "Incidents", section: "incidents" },
      { href: "/admin/tickets", label: "Support", section: "tickets" },
      { href: "/admin/documents", label: "Documents", section: "documents" },
      { href: "/admin/compliance", label: "Compliance", section: "compliance" },
      { href: "/admin/stands", label: "Stands", section: "stands" },
      { href: "/admin/tasks", label: "Tasks", section: "tasks" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/admin/preview", label: "Preview", section: "preview" },
      { href: "/admin/hero", label: "Hero", section: "hero" },
      { href: "/admin/programme", label: "Programme", section: "programme" },
      { href: "/admin/announcements", label: "Announcements", section: "announcements" },
      { href: "/admin/notifications", label: "Notifications", section: "notifications" },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);

const allAdminSections = adminNavItems.map((item) => item.section);

const adminSectionPermissions: Record<Role, AdminSection[]> = {
  admin: allAdminSections,
  super_admin: allAdminSections,
  operations_manager: ["dashboard", "access", "accreditations", "check_in", "vendors", "vendor_applications", "vendor_catalog", "vendor_payments", "vendor_branding", "vendor_handbook", "sponsors", "sponsor_delivery", "incidents", "notifications", "tickets", "stands", "tasks", "analytics", "reports"],
  content_manager: ["dashboard", "hero", "programme", "announcements", "notifications", "analytics", "vendor_branding", "sponsor_delivery", "reports"],
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

export function getAdminNavGroups(role: Role | null | undefined): AdminNavGroup[] {
  if (!role) {
    return [];
  }

  return adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessAdminSection(role, item.section)),
    }))
    .filter((group) => group.items.length > 0);
}

export async function requireAdminSection(section: AdminSection) {
  const session = await requireAnyRole(adminAccessRoles);

  if (!canAccessAdminSection(session.role, section)) {
    redirect("/unauthorized");
  }

  return session;
}
