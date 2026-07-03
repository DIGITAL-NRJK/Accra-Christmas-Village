import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { findUserByClerkIdentity } from "@/db/queries";
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

type DatabaseUser = Awaited<ReturnType<typeof findUserByClerkIdentity>>;

export type AppSession = {
  clerkUserId: string;
  email: string | null;
  role: Role;
  user: DatabaseUser;
  organization: ReturnType<typeof getOrganization>;
};

function getPrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  return user?.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress
    ?? user?.emailAddresses[0]?.emailAddress
    ?? null;
}

function getBootstrapAdminEmails() {
  return (process.env.CLERK_ADMIN_EMAILS ?? process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const getCurrentAppSession = cache(async (): Promise<AppSession | null> => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = getPrimaryEmail(clerkUser);
  const databaseUser = await findUserByClerkIdentity(clerkUser.id, email);
  const bootstrapAdmin = email ? getBootstrapAdminEmails().includes(email.toLowerCase()) : false;
  const role = databaseUser?.role ?? (bootstrapAdmin ? "super_admin" : "visitor");
  const organization = getOrganization(databaseUser?.organizationId ?? null);

  return {
    clerkUserId: clerkUser.id,
    email,
    role,
    user: databaseUser,
    organization,
  };
});

export async function requireAnyRole(allowedRoles: Role[]) {
  const session = await getCurrentAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return session;
}
