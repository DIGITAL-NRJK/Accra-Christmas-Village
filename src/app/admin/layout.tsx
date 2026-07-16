import { adminAccessRoles } from "@/lib/admin-rbac";
import { requireAnyRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(adminAccessRoles);

  return children;
}
