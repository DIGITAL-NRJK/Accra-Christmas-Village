import QRCode from "qrcode";
import { getAccreditationById } from "@/db/queries";
import { createAccreditationToken } from "@/lib/accreditation-token";
import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession, isParticipantRole } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ accreditationId: string }> }) {
  const session = await getCurrentAppSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { accreditationId } = await params;
  const details = await getAccreditationById(accreditationId);
  if (!details) return new Response("Badge not found", { status: 404 });
  const organizer = canAccessAdminSection(session.role, "accreditations");
  const owner = isParticipantRole(session.role) && session.organization?.id === details.organization.id;
  if (!organizer && !owner) return new Response("Forbidden", { status: 403 });

  let token: string;
  try {
    token = createAccreditationToken(details.accreditation.id, details.accreditation.tokenVersion);
  } catch {
    return new Response("QR signing is not configured", { status: 503 });
  }
  const checkInUrl = new URL("/admin/check-in", request.url);
  checkInUrl.searchParams.set("token", token);
  const svg = await QRCode.toString(checkInUrl.toString(), { color: { dark: "#102d25", light: "#ffffff" }, errorCorrectionLevel: "M", margin: 2, type: "svg", width: 420 });
  return new Response(svg, { headers: { "Cache-Control": "private, no-store", "Content-Type": "image/svg+xml; charset=utf-8" } });
}
