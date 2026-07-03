import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { documents } from "@/db/schema";
import type { DocumentStatus } from "@/lib/types";

export type SaveDocumentMetadataInput = {
  id: string;
  organizationId: string;
  requirementId: string;
  uploaderUserId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  storageUrl: string;
};

export async function saveDocumentMetadata(input: SaveDocumentMetadataInput) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped Neon document metadata write because DATABASE_URL is not set.", input);
    return;
  }

  const db = getDb();

  await db
    .insert(documents)
    .values({
      ...input,
      status: "submitted",
      submittedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [documents.organizationId, documents.requirementId],
      set: {
        uploaderUserId: input.uploaderUserId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        storageKey: input.storageKey,
        storageUrl: input.storageUrl,
        status: "submitted",
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedByUserId: null,
        rejectionReason: null,
        reviewerNote: null,
      },
    });
}

export async function reviewDocument(
  documentId: string,
  status: Extract<DocumentStatus, "approved" | "rejected">,
  reviewerUserId: string,
  reviewerNote: string,
) {
  if (!process.env.DATABASE_URL) {
    console.info("Skipped Neon document review because DATABASE_URL is not set.", {
      documentId,
      status,
      reviewerUserId,
      reviewerNote,
    });
    return;
  }

  const db = getDb();

  await db
    .update(documents)
    .set({
      status,
      reviewerNote,
      rejectionReason: status === "rejected" ? reviewerNote : null,
      reviewedAt: new Date(),
      reviewedByUserId: reviewerUserId,
    })
    .where(eq(documents.id, documentId));
}
