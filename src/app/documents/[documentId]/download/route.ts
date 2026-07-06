import { getDocumentById } from "@/db/queries";
import { getCurrentAppSession, isParticipantRole } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";

function getDownloadFileName(fileName: string | null) {
  return fileName?.trim() || "accra-christmas-village-document";
}

function getContentDisposition(fileName: string, disposition: "attachment" | "inline") {
  const asciiName = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/[\\"]/g, "_");

  return `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const session = await getCurrentAppSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const document = await getDocumentById(documentId);

  if (!document?.storageKey) {
    return new Response("Document not found", { status: 404 });
  }

  const isOrganizer = session.role === "admin" || session.role === "super_admin";
  const isOwner = isParticipantRole(session.role) && session.organization?.id === document.organizationId;

  if (!isOrganizer && !isOwner) {
    return new Response("Forbidden", { status: 403 });
  }

  let file: Blob | null = null;

  try {
    file = await documentStorage.get(document.storageKey);
  } catch (error) {
    console.error("Failed to read document storage object.", {
      documentId,
      storageKey: document.storageKey,
      error,
    });

    return new Response("Document storage unavailable", { status: 503 });
  }

  if (!file) {
    return new Response("Document file not found", { status: 404 });
  }

  const fileName = getDownloadFileName(document.fileName);
  const searchParams = new URL(request.url).searchParams;
  const disposition = searchParams.get("disposition") === "inline" ? "inline" : "attachment";
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Disposition": getContentDisposition(fileName, disposition),
    "Content-Type": document.fileType || file.type || "application/octet-stream",
  });

  if (file.size) {
    headers.set("Content-Length", String(file.size));
  }

  return new Response(file, { headers });
}
