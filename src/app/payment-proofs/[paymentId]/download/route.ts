import { canAccessAdminSection } from "@/lib/admin-rbac";
import { getCurrentAppSession } from "@/lib/auth";
import { getVendorPaymentById, getVendorPaymentProofById } from "@/db/vendor-payments";
import { documentStorage } from "@/lib/storage";

function disposition(fileName: string, mode: "attachment" | "inline") {
  const asciiName = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/[\\"]/g, "_");
  return `${mode}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const session = await getCurrentAppSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { paymentId: proofId } = await params;
  const proofRecord = await getVendorPaymentProofById(proofId);
  if (!proofRecord) return new Response("Payment proof not found", { status: 404 });
  const payment = await getVendorPaymentById(proofRecord.paymentId);
  if (!payment) return new Response("Payment request not found", { status: 404 });
  const organizer = canAccessAdminSection(session.role, "vendor_payments");
  const owner = session.role === "vendor" && session.organization?.id === payment.organizationId;
  if (!organizer && !owner) return new Response("Forbidden", { status: 403 });
  const proof = await documentStorage.get(proofRecord.storageKey).catch(() => null);
  if (!proof) return new Response("Payment proof file not found", { status: 404 });
  const mode = new URL(request.url).searchParams.get("disposition") === "inline" ? "inline" : "attachment";
  return new Response(proof, { headers: {
    "Cache-Control": "private, no-store",
    "Content-Disposition": disposition(proofRecord.fileName || "vendor-payment-proof", mode),
    "Content-Type": proofRecord.contentType || proof.type || "application/octet-stream",
  } });
}
