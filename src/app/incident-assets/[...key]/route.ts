import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const session = await getCurrentAppSession();
  if (!session || !canAccessAdminSection(session.role, "incidents")) return new Response("Not found", { status: 404 });
  const { key } = await params;
  const blob = await documentStorage.get(key.join("/"));
  if (!blob) return new Response("Not found", { status: 404 });
  return new Response(blob, { headers: { "Cache-Control": "private, max-age=300", "Content-Type": blob.type || "application/octet-stream" } });
}
