import { getOrganization, organizations, users } from "@/lib/data";
import type { Role, User } from "@/lib/types";

export type DemoSession = {
  role: Role;
  user: User | null;
  organization: ReturnType<typeof getOrganization>;
};

const demoUserByRole: Partial<Record<Role, string>> = {
  vendor: "user-demo-vendor",
  sponsor: "user-demo-sponsor",
  admin: "user-demo-admin",
  super_admin: "user-demo-admin",
};

export function getDemoSession(role: Role = "visitor"): DemoSession {
  const userId = demoUserByRole[role];
  const user = userId ? users.find((candidate) => candidate.id === userId) ?? null : null;
  const organization = user ? getOrganization(user.organizationId) : undefined;

  return {
    role,
    user,
    organization,
  };
}

export function getDemoAdminOrganization() {
  return organizations.find((organization) => organization.type === "organizer");
}
