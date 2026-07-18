"use server";

import { revalidatePath } from "next/cache";
import {
  deleteVendor,
  getVendorById,
  recordAuditLog,
  syncOrganizationCompliance,
  updateVendor,
  type SaveVendorInput,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import { getVendorPaymentByOrganization } from "@/db/vendor-payments";
import type { ComplianceStatus } from "@/lib/types";

export type VendorActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const complianceStatuses: ComplianceStatus[] = [
  "not_started",
  "in_progress",
  "compliant",
  "blocked",
];
const vendorKinds = ["general", "food"] as const;

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function errorState(message: string): VendorActionState {
  return { message, status: "error" };
}

function vendorInput(formData: FormData): SaveVendorInput | { error: string } {
  const tradingName = textValue(formData, "tradingName");
  const category = textValue(formData, "category");
  const contactEmail = textValue(formData, "contactEmail");
  const contactPhone = textValue(formData, "contactPhone");
  const standId = textValue(formData, "standId") || null;
  const onboardingStatus = textValue(formData, "onboardingStatus") as ComplianceStatus;
  const complianceStatus = textValue(formData, "complianceStatus") as ComplianceStatus;
  const vendorKind = textValue(formData, "vendorKind") as (typeof vendorKinds)[number];

  if (!tradingName || !category || !contactEmail) {
    return { error: "Complete trading name, category and contact email." };
  }

  if (!contactEmail.includes("@")) {
    return { error: "Enter a valid contact email." };
  }

  if (
    !complianceStatuses.includes(onboardingStatus) ||
    !complianceStatuses.includes(complianceStatus) ||
    !vendorKinds.includes(vendorKind)
  ) {
    return { error: "Choose valid onboarding and compliance statuses." };
  }

  return {
    approved: formData.get("approved") === "on",
    category,
    complianceStatus,
    contactEmail,
    contactPhone,
    onboardingStatus,
    standId,
    tradingName,
    vendorKind,
  };
}

function revalidateVendorPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/stands");
  revalidatePath("/admin/food-vendor-readiness");
  revalidatePath("/portal/documents");
  revalidatePath("/portal/onboarding");
  revalidatePath("/stands");
}

export async function updateVendorAction(
  _previousState: VendorActionState,
  formData: FormData,
): Promise<VendorActionState> {
  const session = await requireAdminSection("vendors");

  const vendorId = textValue(formData, "vendorId");
  const organizationId = textValue(formData, "organizationId");
  const input = vendorInput(formData);

  if (!vendorId || !organizationId) {
    return errorState("The vendor could not be identified.");
  }

  if ("error" in input) {
    return errorState(input.error);
  }

  const previous = await getVendorById(vendorId);
  const payment = await getVendorPaymentByOrganization(organizationId);
  if (payment && input.standId !== previous?.standId && (payment.status !== "paid" || input.standId !== payment.standId)) {
    return errorState("This Vendor stand is controlled by payment verification. Confirm full payment or keep the reserved stand.");
  }
  const updated = await updateVendor(vendorId, organizationId, input);

  if (!updated) {
    return errorState("The vendor no longer exists or does not match this organization.");
  }
  if (previous?.vendorKind !== input.vendorKind) await syncOrganizationCompliance(organizationId);
  await recordAuditLog({ action: "vendor.updated", actorUserId: session.user?.id ?? null, entityId: vendorId, entityType: "vendor", metadata: { before: previous, after: input } });

  revalidateVendorPaths();

  return { message: "Vendor updated.", status: "success" };
}

export async function deleteVendorAction(formData: FormData) {
  const session = await requireAdminSection("vendors");

  const vendorId = textValue(formData, "vendorId");

  if (!vendorId) {
    return;
  }

  const previous = await getVendorById(vendorId);
  await deleteVendor(vendorId);
  await recordAuditLog({ action: "vendor.deleted", actorUserId: session.user?.id ?? null, entityId: vendorId, entityType: "vendor", metadata: { before: previous } });
  revalidateVendorPaths();
}
