"use server";

import { revalidatePath } from "next/cache";
import {
  createNotification,
  createStaffMember,
  deleteStaffMember,
  getAccreditationById,
  getStaffMemberById,
  issueAccreditation,
  listAccreditationData,
  recordAuditLog,
  revokeAccreditation,
  setAccreditationQuota,
  syncInternalUsersToStaff,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export type AccreditationActionState = { message: string; status: "idle" | "error" | "success" };
const badgeTypes = ["vendor", "sponsor", "partner", "crew", "security", "contractor", "media", "vip"];

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function refreshAccreditations() {
  revalidatePath("/admin");
  revalidatePath("/admin/accreditations");
  revalidatePath("/admin/check-in");
  revalidatePath("/admin/reports");
  revalidatePath("/portal/staff");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function createAdminStaffAction(_state: AccreditationActionState, formData: FormData): Promise<AccreditationActionState> {
  const session = await requireAdminSection("accreditations");
  const organizationId = textValue(formData, "organizationId");
  const fullName = textValue(formData, "fullName");
  const roleLabel = textValue(formData, "roleLabel");
  const staffType = textValue(formData, "staffType");
  const email = textValue(formData, "email").toLowerCase();
  const phone = textValue(formData, "phone");
  if (!organizationId || !fullName || !roleLabel || !staffType) return { message: "Complete the organization, name, role and staff type.", status: "error" };
  const staffMemberId = await createStaffMember({ email, fullName, organizationId, phone, roleLabel, staffType });
  await recordAuditLog({ action: "staff_member.created", actorUserId: session.user?.id ?? null, entityId: staffMemberId, entityType: "staff_member", metadata: { organizationId, roleLabel, staffType } });
  refreshAccreditations();
  return { message: "Staff member added to the accreditation register.", status: "success" };
}

export async function syncInternalStaffAction() {
  const session = await requireAdminSection("accreditations");
  const count = await syncInternalUsersToStaff();
  await recordAuditLog({ action: "staff_member.internal_accounts_synced", actorUserId: session.user?.id ?? null, entityId: "org-festival-ops", entityType: "organization", metadata: { added: count } });
  refreshAccreditations();
}

export async function updateQuotaAction(formData: FormData) {
  const session = await requireAdminSection("accreditations");
  const organizationId = textValue(formData, "organizationId");
  const maximumBadges = Number.parseInt(textValue(formData, "maximumBadges"), 10);
  if (!organizationId || !Number.isInteger(maximumBadges) || maximumBadges < 0 || maximumBadges > 500) return;
  const data = await listAccreditationData(organizationId);
  const previous = data.quotas[0]?.maximumBadges ?? null;
  await setAccreditationQuota(organizationId, maximumBadges, session.user?.id ?? null);
  await recordAuditLog({ action: "accreditation_quota.updated", actorUserId: session.user?.id ?? null, entityId: organizationId, entityType: "organization", metadata: { before: previous, after: maximumBadges } });
  refreshAccreditations();
}

export async function issueAccreditationAction(_state: AccreditationActionState, formData: FormData): Promise<AccreditationActionState> {
  const session = await requireAdminSection("accreditations");
  const staffMemberId = textValue(formData, "staffMemberId");
  const badgeType = textValue(formData, "badgeType");
  const validFrom = new Date(textValue(formData, "validFrom"));
  const validUntil = new Date(textValue(formData, "validUntil"));
  if (!staffMemberId || !badgeTypes.includes(badgeType) || Number.isNaN(validFrom.getTime()) || Number.isNaN(validUntil.getTime()) || validUntil <= validFrom) return { message: "Choose a valid badge type and validity period.", status: "error" };
  const staffMember = await getStaffMemberById(staffMemberId);
  if (!staffMember) return { message: "The staff member no longer exists.", status: "error" };
  const result = await issueAccreditation({ badgeType, issuedByUserId: session.user?.id ?? null, staffMemberId, validFrom, validUntil });
  if (!result.accreditationId || result.error) return { message: result.error || "The badge could not be issued.", status: "error" };
  await createNotification({ actionHref: "/portal/staff", audience: "all", body: `${staffMember.fullName}'s ${badgeType} badge is ready.`, createdByUserId: session.user?.id ?? null, expiresAt: validUntil, organizationId: staffMember.organizationId, title: "Accreditation issued", type: "success" });
  await recordAuditLog({ action: "accreditation.issued", actorUserId: session.user?.id ?? null, entityId: result.accreditationId, entityType: "accreditation", metadata: { badgeType, staffMemberId, validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString() } });
  refreshAccreditations();
  return { message: "Badge issued and participant notified.", status: "success" };
}

export async function revokeAccreditationAction(_state: AccreditationActionState, formData: FormData): Promise<AccreditationActionState> {
  const session = await requireAdminSection("accreditations");
  const accreditationId = textValue(formData, "accreditationId");
  const reason = textValue(formData, "reason");
  if (!accreditationId || !reason) return { message: "Provide a revocation reason.", status: "error" };
  const details = await getAccreditationById(accreditationId);
  if (!details) return { message: "The badge no longer exists.", status: "error" };
  await revokeAccreditation(accreditationId, reason, session.user?.id ?? null);
  await createNotification({ actionHref: "/portal/staff", audience: "all", body: `${details.staffMember.fullName}'s badge was revoked: ${reason}`, createdByUserId: session.user?.id ?? null, expiresAt: null, organizationId: details.organization.id, title: "Accreditation revoked", type: "critical" });
  await recordAuditLog({ action: "accreditation.revoked", actorUserId: session.user?.id ?? null, entityId: accreditationId, entityType: "accreditation", metadata: { before: details.accreditation.status, after: "revoked", reason } });
  refreshAccreditations();
  return { message: "Badge revoked immediately.", status: "success" };
}

export async function deleteAdminStaffAction(formData: FormData) {
  const session = await requireAdminSection("accreditations");
  const staffMemberId = textValue(formData, "staffMemberId");
  const staffMember = await getStaffMemberById(staffMemberId);
  if (!staffMember) return;
  const data = await listAccreditationData(staffMember.organizationId);
  if (data.accreditations.some((badge) => badge.staffMemberId === staffMemberId)) return;
  await deleteStaffMember(staffMemberId);
  await recordAuditLog({ action: "staff_member.deleted", actorUserId: session.user?.id ?? null, entityId: staffMemberId, entityType: "staff_member", metadata: { before: { fullName: staffMember.fullName, organizationId: staffMember.organizationId, roleLabel: staffMember.roleLabel } } });
  refreshAccreditations();
}
