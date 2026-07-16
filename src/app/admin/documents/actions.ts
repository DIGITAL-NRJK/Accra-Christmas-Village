"use server";

import { revalidatePath } from "next/cache";
import { reviewDocument as persistDocumentReview } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export async function approveDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "Approved for event operations.");
  const expiresAtValue = String(formData.get("expiresAt") ?? "");
  const expiresAt = expiresAtValue ? new Date(`${expiresAtValue}T23:59:59`) : null;
  const session = await requireAdminSection("documents");

  if (!documentId || !session.user) {
    return;
  }

  await persistDocumentReview(
    documentId,
    "approved",
    session.user.id,
    reviewerNote,
    expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  );
  revalidatePath("/admin/documents");
  revalidatePath("/portal/documents");
}

export async function rejectDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "");
  const session = await requireAdminSection("documents");

  if (!documentId || !session.user) {
    return;
  }

  await persistDocumentReview(documentId, "rejected", session.user.id, reviewerNote || "Please resubmit.");
  revalidatePath("/admin/documents");
  revalidatePath("/portal/documents");
}
