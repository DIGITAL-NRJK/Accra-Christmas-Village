"use server";

import { revalidatePath } from "next/cache";
import { approveAccessRequest, rejectAccessRequest } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export async function approveRequest(formData: FormData) {
  const session = await requireAnyRole(["admin", "super_admin"]);
  const requestId = String(formData.get("requestId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "Approved by organizer.").trim();

  if (!requestId) {
    return;
  }

  await approveAccessRequest(requestId, reviewerNote || "Approved by organizer.", session.user?.id ?? null);
  revalidatePath("/admin");
  revalidatePath("/admin/access-requests");
}

export async function rejectRequest(formData: FormData) {
  const session = await requireAnyRole(["admin", "super_admin"]);
  const requestId = String(formData.get("requestId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "Please contact the organizer team.").trim();

  if (!requestId) {
    return;
  }

  await rejectAccessRequest(requestId, reviewerNote || "Please contact the organizer team.", session.user?.id ?? null);
  revalidatePath("/admin");
  revalidatePath("/admin/access-requests");
}
