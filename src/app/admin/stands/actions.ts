"use server";

import { revalidatePath } from "next/cache";
import { assignStand, createNotification, getStandById, recordAuditLog } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export async function assignStandAction(formData: FormData) {
  const session = await requireAdminSection("stands");

  const standId = String(formData.get("standId") ?? "");
  const participantType = String(formData.get("participantType") ?? "none") as "vendor" | "sponsor" | "none";
  const organizationId = String(formData.get("organizationId") ?? "");

  if (!standId) {
    return;
  }

  await assignStand({ standId, participantType, organizationId });
  const stand = await getStandById(standId);
  if (stand && participantType !== "none" && organizationId) {
    await createNotification({ actionHref: "/portal/stand", audience: participantType, body: `${stand.code} · ${stand.name} has been assigned to your organization.`, createdByUserId: session.user?.id ?? null, expiresAt: null, organizationId, title: "Stand assignment updated", type: "info" });
  }
  await recordAuditLog({ action: "stand.assignment_changed", actorUserId: session.user?.id ?? null, entityId: standId, entityType: "stand", metadata: { organizationId: organizationId || null, participantType } });

  revalidatePath("/admin");
  revalidatePath("/admin/stands");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/sponsors");
  revalidatePath("/portal");
  revalidatePath("/portal/stand");
}
