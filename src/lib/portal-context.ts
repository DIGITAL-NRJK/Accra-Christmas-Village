import { redirect } from "next/navigation";
import { getOrganizationById } from "@/db/queries";
import {
  getCurrentAppSession,
  isAdminRole,
  isParticipantRole,
  type AppSession,
} from "@/lib/auth";
import type { Organization, ParticipantRole, Role } from "@/lib/types";

export type PortalSearchParams = {
  organizationId?: string;
  previewRole?: string;
};

export type PortalContext = {
  isAdminPreview: boolean;
  organization: Organization;
  previewQuery: string;
  role: ParticipantRole;
  session: AppSession;
};

function toOrganization(organization: Awaited<ReturnType<typeof getOrganizationById>>): Organization | undefined {
  if (!organization) {
    return undefined;
  }

  return {
    contactEmail: organization.contactEmail,
    contactPhone: organization.contactPhone,
    id: organization.id,
    name: organization.name,
    status: organization.status,
    type: organization.type,
  };
}

function getPreviewQuery(isAdminPreview: boolean, role: ParticipantRole, organizationId: string) {
  if (!isAdminPreview) {
    return "";
  }

  return `?previewRole=${encodeURIComponent(role)}&organizationId=${encodeURIComponent(organizationId)}`;
}

export async function getPortalContext(
  searchParams?: PortalSearchParams | null,
): Promise<PortalContext | null> {
  const session = await getCurrentAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  const requestedPreviewRole = searchParams?.previewRole as Role | undefined;
  const previewRole = requestedPreviewRole && isParticipantRole(requestedPreviewRole)
    ? requestedPreviewRole
    : null;
  const isAdminPreview = isAdminRole(session.role) && Boolean(previewRole);
  const previewOrganization = isAdminPreview
    ? toOrganization(await getOrganizationById(searchParams?.organizationId ?? null))
    : undefined;
  const effectiveRole = isAdminPreview && previewRole ? previewRole : session.role;
  const effectiveOrganization = previewOrganization ?? session.organization;

  if (!isParticipantRole(effectiveRole) || !effectiveOrganization) {
    return null;
  }

  return {
    isAdminPreview,
    organization: effectiveOrganization,
    previewQuery: getPreviewQuery(isAdminPreview, effectiveRole, effectiveOrganization.id),
    role: effectiveRole,
    session,
  };
}

export async function requirePortalContext(searchParams?: PortalSearchParams | null) {
  const context = await getPortalContext(searchParams);

  if (!context) {
    redirect("/unauthorized");
  }

  return context;
}
