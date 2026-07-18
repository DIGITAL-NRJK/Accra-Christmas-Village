import { getVendorBrandAssetById } from "@/db/vendor-branding";
import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";

function contentDisposition(fileName: string) {
  const safeName = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/[\\"]/g, "_");
  return `inline; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const row = await getVendorBrandAssetById(assetId);
  if (!row) return new Response("Vendor image not found", { status: 404 });
  const publiclyVisible = row.profile.status === "published" && row.asset.status === "approved";
  if (!publiclyVisible) {
    const session = await getCurrentAppSession();
    if (!session) return new Response("Unauthorized", { status: 401 });
    const organizer = canAccessAdminSection(session.role, "vendor_branding");
    const owner = session.role === "vendor" && session.organization?.id === row.profile.organizationId;
    if (!organizer && !owner) return new Response("Forbidden", { status: 403 });
  }
  const file = await documentStorage.get(row.asset.storageKey).catch(() => null);
  if (!file) return new Response("Vendor image file not found", { status: 404 });
  return new Response(file, {
    headers: {
      "Cache-Control": publiclyVisible ? "public, max-age=300, must-revalidate" : "private, no-store",
      "Content-Disposition": contentDisposition(row.asset.fileName),
      "Content-Type": row.asset.contentType || file.type || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
