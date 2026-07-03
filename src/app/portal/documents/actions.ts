"use server";

import { revalidatePath } from "next/cache";
import { saveDocumentMetadata } from "@/db/queries";
import { getDemoSession } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";

export async function uploadDocument(formData: FormData) {
  const requirementId = String(formData.get("requirementId") ?? "");
  const file = formData.get("file");
  const session = getDemoSession("vendor");

  if (!session.user || !session.organization || !requirementId) {
    return;
  }

  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const storedFile = await documentStorage.put(file, {
    organizationId: session.organization.id,
    requirementId,
  });

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
}
