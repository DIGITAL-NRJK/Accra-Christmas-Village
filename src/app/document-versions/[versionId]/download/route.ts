import { getDocumentVersionById } from "@/db/queries";
import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession, isParticipantRole } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";

function contentDisposition(fileName: string) {
  const asciiName = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/[\\"]/g, "_");
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const session = await getCurrentAppSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { versionId } = await params;
  const version = await getDocumentVersionById(versionId);
  if (!version) return new Response("Document version not found", { status: 404 });

  const isOrganizer = canAccessAdminSection(session.role, "documents");
  const isOwner = isParticipantRole(session.role) && session.organization?.id === version.organizationId;
  if (!isOrganizer && !isOwner) return new Response("Forbidden", { status: 403 });

  const file = await documentStorage.get(version.storageKey).catch(() => null);
  if (!file) return new Response("Document file not found", { status: 404 });

  return new Response(file, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": contentDisposition(version.fileName),
      "Content-Type": version.fileType || file.type || "application/octet-stream",
    },
  });
}
