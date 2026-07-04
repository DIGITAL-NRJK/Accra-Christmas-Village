"use server";

import { revalidatePath } from "next/cache";
import { saveDocumentMetadata } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";
import {
  allowedDocumentExtensions,
  allowedDocumentMimeTypes,
  defaultMaxDocumentUploadBytes,
  formatFileSize,
} from "@/lib/document-upload";
import { documentStorage } from "@/lib/storage";

export type UploadDocumentState = {
  message: string;
  status: "idle" | "error" | "success";
  uploadedFileName?: string;
};

const allowedDocumentMimeTypeSet = new Set<string>(allowedDocumentMimeTypes);

function getMaxDocumentUploadBytes() {
  const configuredLimit = Number(process.env.DOCUMENT_UPLOAD_MAX_BYTES);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : defaultMaxDocumentUploadBytes;
}

function isAllowedDocumentFile(file: File) {
  const fileName = file.name.toLowerCase();

  return allowedDocumentMimeTypeSet.has(file.type)
    || allowedDocumentExtensions.some((extension) => fileName.endsWith(extension));
}

function getErrorState(message: string): UploadDocumentState {
  return { message, status: "error" };
}

export async function uploadDocument(
  _previousState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const requirementId = String(formData.get("requirementId") ?? "");
  const file = formData.get("file");
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);

  if (!session.user || !session.organization || !requirementId) {
    return getErrorState("We could not link this upload to your participant profile.");
  }

  if (!(file instanceof File) || file.size === 0) {
    return getErrorState("Choose a document before uploading.");
  }

  const maxUploadBytes = getMaxDocumentUploadBytes();

  if (file.size > maxUploadBytes) {
    return getErrorState(`Upload a file smaller than ${formatFileSize(maxUploadBytes)}.`);
  }

  if (!isAllowedDocumentFile(file)) {
    return getErrorState("Upload a PDF, image, Word document or spreadsheet.");
  }

  let storedFile;

  try {
    storedFile = await documentStorage.put(file, {
      organizationId: session.organization.id,
      requirementId,
    });
  } catch (error) {
    console.error("Document upload failed.", {
      organizationId: session.organization.id,
      requirementId,
      error,
    });

    return getErrorState("The file could not be saved. Try again in a moment.");
  }

  await saveDocumentMetadata({
    id: crypto.randomUUID(),
    organizationId: session.organization.id,
    requirementId,
    uploaderUserId: session.user.id,
    fileName: storedFile.fileName,
    fileType: storedFile.contentType,
    fileSize: storedFile.size,
    storageKey: storedFile.key,
    storageUrl: storedFile.url,
  });

  revalidatePath("/portal/documents");
  revalidatePath("/admin/documents");

  return {
    message: "Document uploaded. Organizers can now review it.",
    status: "success",
    uploadedFileName: storedFile.fileName,
  };
}
