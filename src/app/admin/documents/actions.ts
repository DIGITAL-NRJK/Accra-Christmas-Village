"use server";

import { revalidatePath } from "next/cache";
import { createNotification, getDocumentById, processDocumentExpiryReminders, recordAuditLog, reviewDocument as persistDocumentReview } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export async function approveDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const reviewerNote = String(formData.get("participantMessage") ?? "Approved for event operations.").trim();
  const internalNote = String(formData.get("internalNote") ?? "").trim();
  const issuedAtValue = String(formData.get("issuedAt") ?? "");
  const expiresAtValue = String(formData.get("expiresAt") ?? "");
  const issuedAt = issuedAtValue ? new Date(`${issuedAtValue}T00:00:00`) : null;
  const expiresAt = expiresAtValue ? new Date(`${expiresAtValue}T23:59:59`) : null;
  const session = await requireAdminSection("documents");

  if (!documentId || !session.user) {
    return;
  }

  const document = await getDocumentById(documentId);
  if (!document) return;

  await persistDocumentReview(
    documentId,
    "approved",
    session.user.id,
    reviewerNote,
    expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    internalNote || null,
    issuedAt && !Number.isNaN(issuedAt.getTime()) ? issuedAt : null,
  );
  await recordAuditLog({ action: "document.approved", actorUserId: session.user.id, entityId: documentId, entityType: "document", metadata: { expiresAt: expiresAt?.toISOString() ?? null, issuedAt: issuedAt?.toISOString() ?? null, internalNote } });
  await createNotification({ actionHref: "/portal/documents", audience: "all", body: reviewerNote || `${document.fileName ?? "Your document"} has been approved.`, createdByUserId: session.user.id, expiresAt: null, organizationId: document.organizationId, title: "Document approved", type: "success" });
  revalidatePath("/admin/documents");
  revalidatePath("/portal/documents");
}

export async function rejectDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const reviewerNote = String(formData.get("participantMessage") ?? "").trim();
  const internalNote = String(formData.get("internalNote") ?? "").trim();
  const session = await requireAdminSection("documents");

  if (!documentId || !session.user) {
    return;
  }

  const document = await getDocumentById(documentId);
  if (!document) return;

  await persistDocumentReview(documentId, "rejected", session.user.id, reviewerNote || "Please resubmit.", null, internalNote || null);
  await recordAuditLog({ action: "document.rejected", actorUserId: session.user.id, entityId: documentId, entityType: "document", metadata: { reviewerNote: reviewerNote || "Please resubmit.", internalNote } });
  await createNotification({ actionHref: "/portal/documents", audience: "all", body: `${document.fileName ?? "Your document"} needs a replacement. ${reviewerNote || "Please resubmit."}`, createdByUserId: session.user.id, expiresAt: null, organizationId: document.organizationId, title: "Document rejected", type: "warning" });
  revalidatePath("/admin/documents");
  revalidatePath("/portal/documents");
}

export async function sendExpirationRemindersAction() {
  const session = await requireAdminSection("documents");
  const result = await processDocumentExpiryReminders(session.user?.id ?? null);
  await recordAuditLog({ action: "document.expiration_scan", actorUserId: session.user?.id ?? null, entityId: "expiry-scan", entityType: "document", metadata: result });
  revalidatePath("/admin/documents");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
