"use server";

import { revalidatePath } from "next/cache";
import { createNotification, deleteNotification, recordAuditLog } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export type NotificationActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function revalidateNotificationPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/notifications");
  revalidatePath("/portal/notifications");
}

export async function createNotificationAction(
  _state: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const session = await requireAdminSection("notifications");
  const title = textValue(formData, "title");
  const body = textValue(formData, "body");
  const audience = textValue(formData, "audience") || "all";
  const type = textValue(formData, "type") || "info";
  const organizationId = textValue(formData, "organizationId") || null;
  const actionHref = textValue(formData, "actionHref") || null;
  const expiresAtValue = textValue(formData, "expiresAt");
  const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;

  if (!title || !body) {
    return { message: "Complete the title and message.", status: "error" };
  }

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return { message: "Choose a valid expiration date.", status: "error" };
  }

  await createNotification({
    actionHref,
    audience,
    body,
    createdByUserId: session.user?.id ?? null,
    expiresAt,
    organizationId,
    title,
    type,
  });
  await recordAuditLog({ action: "notification.sent", actorUserId: session.user?.id ?? null, entityId: title, entityType: "notification", metadata: { audience, organizationId, type } });
  revalidateNotificationPaths();

  return { message: "Notification sent.", status: "success" };
}

export async function deleteNotificationAction(formData: FormData) {
  const session = await requireAdminSection("notifications");
  const notificationId = textValue(formData, "notificationId");
  await deleteNotification(notificationId);
  await recordAuditLog({ action: "notification.deleted", actorUserId: session.user?.id ?? null, entityId: notificationId, entityType: "notification" });
  revalidateNotificationPaths();
}
