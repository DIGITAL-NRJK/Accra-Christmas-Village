import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getOrganizationById, syncClerkUserProfile } from "@/db/queries";
import { getOrganization } from "@/lib/data";
import type { Organization, ParticipantRole, Role } from "@/lib/types";

type DatabaseUser = Awaited<ReturnType<typeof syncClerkUserProfile>>;

export type AppSession = {
  clerkUserId: string;
  email: string | null;
  name: string;
  role: Role;
  user: DatabaseUser;
  organization: Organization | undefined;
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

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>, email: string | null) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

  return name || user?.username || email || "Participant";
}

export function isParticipantRole(role: Role): role is ParticipantRole {
  return role === "vendor" || role === "sponsor" || role === "partner";
}

export function isAdminRole(role: Role) {
  return (
    role === "admin" ||
    role === "super_admin" ||
    role === "operations_manager" ||
    role === "content_manager" ||
    role === "compliance_manager" ||
    role === "stand_manager"
  );
}

async function getSessionOrganization(organizationId: string | null | undefined): Promise<Organization | undefined> {
  if (!organizationId) {
    return undefined;
  }

  const databaseOrganization = await getOrganizationById(organizationId);

  if (databaseOrganization) {
    return {
      id: databaseOrganization.id,
      name: databaseOrganization.name,
      type: databaseOrganization.type,
      contactEmail: databaseOrganization.contactEmail,
      contactPhone: databaseOrganization.contactPhone,
      status: databaseOrganization.status,
    };
  }

  return getOrganization(organizationId);
}

export const getCurrentAppSession = cache(async (): Promise<AppSession | null> => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = getPrimaryEmail(clerkUser);
  const name = getDisplayName(clerkUser, email);
  const adminEmails = getBootstrapAdminEmails();
  const databaseUser = await syncClerkUserProfile({
    clerkUserId: clerkUser.id,
    email,
    fullName: name,
    adminEmails,
  });
  const bootstrapAdmin = email ? adminEmails.includes(email.toLowerCase()) : false;
  const role = databaseUser?.role ?? (bootstrapAdmin ? "super_admin" : "visitor");
  const organization = await getSessionOrganization(databaseUser?.organizationId);

  return {
    clerkUserId: clerkUser.id,
    email,
    name,
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
