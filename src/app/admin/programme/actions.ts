"use server";

import { revalidatePath } from "next/cache";
import { createProgrammeItem, updateProgrammePublication } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export async function createProgrammeItemAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const title = String(formData.get("title") ?? "").trim();
  const day = String(formData.get("day") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim() || "All visitors";
  const description = String(formData.get("description") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !day || !startsAt || !endsAt || !category || !location || !description) {
    return;
  }

  await createProgrammeItem({
    title,
    day,
    startsAt,
    endsAt,
    category,
    location,
    audience,
    description,
    published,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/programme");
  revalidatePath("/programme");
}

export async function updateProgrammePublicationAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const eventId = String(formData.get("eventId") ?? "");
  const published = formData.get("published") === "on";

  await updateProgrammePublication(eventId, published);

  revalidatePath("/admin");
  revalidatePath("/admin/programme");
  revalidatePath("/programme");
}
