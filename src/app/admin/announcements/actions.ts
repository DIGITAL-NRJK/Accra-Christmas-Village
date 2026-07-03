"use server";

import { revalidatePath } from "next/cache";
import { createAnnouncement } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export async function createAnnouncementAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");
  const priority = String(formData.get("priority") ?? "normal");
  const published = formData.get("published") === "on";

  if (!title || !body) {
    return;
  }

  await createAnnouncement({ title, body, audience, priority, published });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
  revalidatePath("/portal/messages");
}
