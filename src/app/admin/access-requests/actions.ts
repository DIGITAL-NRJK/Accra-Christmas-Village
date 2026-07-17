"use server";

import { revalidatePath } from "next/cache";
import {
  approveAccessRequest,
  createNotification,
  findUserByClerkIdentity,
  getAccessRequestById,
  recordAuditLog,
  rejectAccessRequest,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export async function approveRequest(formData: FormData) {
  const session = await requireAdminSection("access");
  const requestId = String(formData.get("requestId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "Approved by organizer.").trim();

  if (!requestId) {
    return;
  }

  const request = await getAccessRequestById(requestId);
  if (!request) return;

  await approveAccessRequest(requestId, reviewerNote || "Approved by organizer.", session.user?.id ?? null);
  const recipient = await findUserByClerkIdentity(request.clerkUserId, request.email);
  if (recipient) {
    await createNotification({
      actionHref: "/portal",
      audience: request.requestedRole,
      body: reviewerNote || "Your participant access has been approved by the organizer.",
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: recipient.organizationId,
      recipientUserId: recipient.id,
      title: "Access request approved",
      type: "success",
    });
  }
  await recordAuditLog({ action: "access_request.approved", actorUserId: session.user?.id ?? null, entityId: requestId, entityType: "access_request", metadata: { requestedRole: request.requestedRole } });
  revalidatePath("/admin");
  revalidatePath("/admin/access-requests");
}

export async function rejectRequest(formData: FormData) {
  const session = await requireAdminSection("access");
  const requestId = String(formData.get("requestId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "Please contact the organizer team.").trim();

  if (!requestId) {
    return;
  }

  const request = await getAccessRequestById(requestId);
  if (!request) return;

  await rejectAccessRequest(requestId, reviewerNote || "Please contact the organizer team.", session.user?.id ?? null);
  const recipient = await findUserByClerkIdentity(request.clerkUserId, request.email);
  if (recipient) {
    await createNotification({
      actionHref: "/portal",
      audience: "all",
      body: reviewerNote || "Please contact the organizer team.",
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: recipient.organizationId,
      recipientUserId: recipient.id,
      title: "Access request rejected",
      type: "warning",
    });
  }
  await recordAuditLog({ action: "access_request.rejected", actorUserId: session.user?.id ?? null, entityId: requestId, entityType: "access_request", metadata: { requestedRole: request.requestedRole } });
  revalidatePath("/admin");
  revalidatePath("/admin/access-requests");
}
