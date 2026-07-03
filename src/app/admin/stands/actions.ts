"use server";

import { revalidatePath } from "next/cache";
import { assignStand } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export async function assignStandAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const standId = String(formData.get("standId") ?? "");
  const participantType = String(formData.get("participantType") ?? "none") as "vendor" | "sponsor" | "none";
  const organizationId = String(formData.get("organizationId") ?? "");

  if (!standId) {
    return;
  }

  await assignStand({ standId, participantType, organizationId });

  revalidatePath("/admin");
  revalidatePath("/admin/stands");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/sponsors");
  revalidatePath("/portal");
  revalidatePath("/portal/stand");
}
