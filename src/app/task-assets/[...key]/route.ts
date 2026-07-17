import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession } from "@/lib/auth";
import { documentStorage } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const session = await getCurrentAppSession();
  if (!session || !canAccessAdminSection(session.role, "tasks")) return new Response("Forbidden", { status: 403 });
  const { key } = await params;
  const file = await documentStorage.get(key.join("/")).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file, { headers: { "Cache-Control": "private, no-store", "Content-Type": file.type || "application/octet-stream" } });
}
