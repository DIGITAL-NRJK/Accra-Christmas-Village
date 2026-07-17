"use server";

import { revalidatePath } from "next/cache";
import { getAccreditationById, recordAccreditationScan, recordAuditLog } from "@/db/queries";
import { verifyAccreditationToken } from "@/lib/accreditation-token";
import { requireAdminSection } from "@/lib/admin-rbac";

export type CheckInState = {
  badgeNumber?: string;
  badgeType?: string;
  denialReason?: string | null;
  direction?: "entry" | "exit";
  fullName?: string;
  message: string;
  organizationName?: string;
  outcome?: "allowed" | "denied";
  status: "idle" | "error" | "success";
};

function extractToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 600) return "";
  try {
    return new URL(trimmed).searchParams.get("token") ?? "";
  } catch {
    return trimmed;
  }
}

export async function scanAccreditationAction(_state: CheckInState, formData: FormData): Promise<CheckInState> {
  const session = await requireAdminSection("check_in");
  const token = extractToken(String(formData.get("token") ?? ""));
  const checkpoint = String(formData.get("checkpoint") ?? "").trim().slice(0, 80);
  const direction = String(formData.get("direction") ?? "entry") as "entry" | "exit";
  if (!token || !checkpoint || !["entry", "exit"].includes(direction)) return { message: "Scan a badge and choose a checkpoint.", status: "error" };

  let verified: ReturnType<typeof verifyAccreditationToken>;
  try {
    verified = verifyAccreditationToken(token);
  } catch {
    return { message: "QR signing is not configured on this environment.", status: "error" };
  }
  if (!verified) return { message: "Invalid or altered QR code.", status: "error" };
  const details = await getAccreditationById(verified.accreditationId);
  if (!details || details.accreditation.tokenVersion !== verified.tokenVersion) return { message: "This QR code is no longer valid.", status: "error" };
  const result = await recordAccreditationScan({ accreditationId: verified.accreditationId, checkpoint, direction, scannedByUserId: session.user?.id ?? null });
  if (!result) return { message: "The badge could not be checked.", status: "error" };
  await recordAuditLog({ action: `accreditation.${result.outcome === "allowed" ? "checked" : "denied"}`, actorUserId: session.user?.id ?? null, entityId: result.accreditationId, entityType: "accreditation", metadata: { checkpoint, denialReason: result.denialReason, direction } });
  revalidatePath("/admin/check-in");
  revalidatePath("/admin/accreditations");
  return { ...result, message: result.outcome === "allowed" ? `${direction === "entry" ? "Entry" : "Exit"} recorded.` : result.denialReason || "Access denied.", status: "success" };
}
