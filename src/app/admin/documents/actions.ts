"use server";

import { revalidatePath } from "next/cache";
import { reviewDocument as persistDocumentReview } from "@/db/queries";
import { getDemoSession } from "@/lib/auth";

export async function approveDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "Approved for V1 demo.");
  const session = getDemoSession("admin");

  if (!documentId || !session.user) {
    return;
  }

  await persistDocumentReview(documentId, "approved", session.user.id, reviewerNote);
  revalidatePath("/admin/documents");
  revalidatePath("/portal/documents");
}

export async function rejectDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "");
  const session = getDemoSession("admin");

  if (!documentId || !session.user) {
    return;
  }

  await persistDocumentReview(documentId, "rejected", session.user.id, reviewerNote || "Please resubmit.");
  revalidatePath("/admin/documents");
  revalidatePath("/portal/documents");
}
