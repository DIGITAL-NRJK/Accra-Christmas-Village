"use server";

import { revalidatePath } from "next/cache";
import { createStaffMember, deleteStaffMember, getStaffMemberById, listAccreditationData, recordAuditLog, updateStaffMember } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export type StaffActionState = { message: string; status: "idle" | "error" | "success" };

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function refreshStaff() {
  revalidatePath("/portal/staff");
  revalidatePath("/admin/accreditations");
}

export async function createPortalStaffAction(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  if (!session.user?.organizationId) return { message: "Your account is not linked to an organization.", status: "error" };
  const fullName = textValue(formData, "fullName");
  const roleLabel = textValue(formData, "roleLabel");
  const email = textValue(formData, "email").toLowerCase();
  const phone = textValue(formData, "phone");
  if (!fullName || !roleLabel) return { message: "Complete the staff member's name and event role.", status: "error" };
  if (email && !email.includes("@")) return { message: "Enter a valid email address or leave it empty.", status: "error" };
  const staffMemberId = await createStaffMember({ email, fullName, organizationId: session.user.organizationId, phone, roleLabel, staffType: session.role });
  await recordAuditLog({ action: "staff_member.declared", actorUserId: session.user.id, entityId: staffMemberId, entityType: "staff_member", metadata: { organizationId: session.user.organizationId, roleLabel } });
  refreshStaff();
  return { message: "Staff member declared. Organizers can now issue a badge.", status: "success" };
}

export async function updatePortalStaffAction(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const staffMemberId = textValue(formData, "staffMemberId");
  const staffMember = await getStaffMemberById(staffMemberId);
  if (!session.user?.organizationId || !staffMember || staffMember.organizationId !== session.user.organizationId) return { message: "This staff member is outside your organization.", status: "error" };
  const fullName = textValue(formData, "fullName");
  const roleLabel = textValue(formData, "roleLabel");
  const email = textValue(formData, "email").toLowerCase();
  const phone = textValue(formData, "phone");
  if (!fullName || !roleLabel || (email && !email.includes("@"))) return { message: "Enter a name, role and valid email address.", status: "error" };
  await updateStaffMember(staffMemberId, { active: formData.get("active") === "on", email, fullName, phone, roleLabel, staffType: session.role });
  await recordAuditLog({ action: "staff_member.updated", actorUserId: session.user.id, entityId: staffMemberId, entityType: "staff_member", metadata: { before: { active: staffMember.active, email: staffMember.email, fullName: staffMember.fullName, phone: staffMember.phone, roleLabel: staffMember.roleLabel }, after: { active: formData.get("active") === "on", email, fullName, phone, roleLabel } } });
  refreshStaff();
  return { message: "Staff member updated.", status: "success" };
}

export async function deletePortalStaffAction(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const staffMemberId = textValue(formData, "staffMemberId");
  const staffMember = await getStaffMemberById(staffMemberId);
  if (!session.user?.organizationId || !staffMember || staffMember.organizationId !== session.user.organizationId) return { message: "This staff member is outside your organization.", status: "error" };
  const data = await listAccreditationData(session.user.organizationId);
  if (data.accreditations.some((badge) => badge.staffMemberId === staffMemberId)) return { message: "A badge history exists. Deactivate this staff member instead of deleting them.", status: "error" };
  await deleteStaffMember(staffMemberId);
  await recordAuditLog({ action: "staff_member.deleted", actorUserId: session.user.id, entityId: staffMemberId, entityType: "staff_member", metadata: { fullName: staffMember.fullName, organizationId: staffMember.organizationId } });
  refreshStaff();
  return { message: "Staff member removed.", status: "success" };
}
