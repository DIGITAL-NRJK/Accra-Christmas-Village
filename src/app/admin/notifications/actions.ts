"use server";

import { revalidatePath } from "next/cache";
import { createNotification, deleteNotification } from "@/db/queries";
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
  revalidateNotificationPaths();

  return { message: "Notification sent.", status: "success" };
}

export async function deleteNotificationAction(formData: FormData) {
  await requireAdminSection("notifications");
  await deleteNotification(textValue(formData, "notificationId"));
  revalidateNotificationPaths();
}
