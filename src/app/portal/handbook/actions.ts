"use server";

import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/db/queries";
import { getVendorApplicationByOrganization } from "@/db/vendor-applications";
import { acknowledgeVendorHandbookSection } from "@/db/vendor-handbook";
import { requireAnyRole } from "@/lib/auth";

export async function acknowledgeHandbookSectionAction(formData: FormData) {
  const session = await requireAnyRole(["vendor"]);
  const organizationId = session.user?.organizationId;
  const sectionId = String(formData.get("sectionId") ?? "").trim().slice(0, 100);
  if (!organizationId || !sectionId) return;
  const application = await getVendorApplicationByOrganization(organizationId);
  const acknowledgement = await acknowledgeVendorHandbookSection({
    organizationId,
    sectionId,
    userId: session.user?.id ?? null,
    vendorKind: application?.vendorKind ?? "general",
  });
  if (!acknowledgement) return;
  await recordAuditLog({
    action: "vendor_handbook_section.acknowledged",
    actorUserId: session.user?.id ?? null,
    entityId: sectionId,
    entityType: "vendor_handbook_section",
    metadata: { organizationId },
  });
  revalidatePath("/portal/handbook");
  revalidatePath("/portal/onboarding");
  revalidatePath("/admin/vendor-handbook");
  revalidatePath("/admin");
}
