"use server";

import { revalidatePath } from "next/cache";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/db/queries";
import { getCurrentAppSession } from "@/lib/auth";

export async function markNotificationReadAction(formData: FormData) {
  const session = await getCurrentAppSession();
  const notificationId = String(formData.get("notificationId") ?? "");

  if (!session?.user || !notificationId) return;
  await markNotificationRead(notificationId, session.user.id);
  revalidatePath("/portal/notifications");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await getCurrentAppSession();
  if (!session?.user) return;
  const items = await listNotificationsForUser(session.user.id, session.role, session.user.organizationId);
  await markAllNotificationsRead(items.map((item) => item.id), session.user.id);
  revalidatePath("/portal/notifications");
  revalidatePath("/", "layout");
}
