"use server";

import { revalidatePath } from "next/cache";
import {
  getVendorBrandAssetById,
  getVendorBrandProfileById,
  getVendorBrandRecipient,
  reviewVendorBrandAsset,
  reviewVendorBrandProfile,
} from "@/db/vendor-branding";
import { createNotification, recordAuditLog } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export type VendorBrandReviewState = { message: string; status: "idle" | "error" | "success" };

function result(message: string, status: VendorBrandReviewState["status"]): VendorBrandReviewState {
  return { message, status };
}

function clean(value: FormDataEntryValue | null, maxLength = 2_000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function revalidateVendorBranding(slug?: string) {
  revalidatePath("/admin/vendor-branding");
  revalidatePath("/portal/brand-profile");
  revalidatePath("/portal/onboarding");
  revalidatePath("/stands");
  if (slug) revalidatePath(`/vendors/${slug}`);
}

export async function reviewVendorBrandAssetAction(
  _previousState: VendorBrandReviewState,
  formData: FormData,
): Promise<VendorBrandReviewState> {
  const session = await requireAdminSection("vendor_branding");
  const assetId = clean(formData.get("assetId"), 100);
  const decision = clean(formData.get("decision"), 30);
  const note = clean(formData.get("reviewerNote"));
  if (!assetId || !["approved", "rejected"].includes(decision)) return result("Choose an image decision.", "error");
  if (decision === "rejected" && note.length < 10) return result("Explain the requested replacement in at least 10 characters.", "error");
  const current = await getVendorBrandAssetById(assetId);
  if (!current) return result("Vendor image not found.", "error");
  if (current.asset.status !== "submitted") return result("This image already has a review decision.", "error");
  if (!["submitted", "under_review"].includes(current.profile.status)) return result("Images can only be reviewed while the profile is awaiting a decision.", "error");
  const updated = await reviewVendorBrandAsset({ assetId, decision: decision as "approved" | "rejected", note, reviewerUserId: session.user?.id ?? null });
  if (!updated) return result("The image decision could not be saved.", "error");
  const recipient = await getVendorBrandRecipient(current.profile.organizationId);
  await Promise.all([
    recipient ? createNotification({
      actionHref: "/portal/brand-profile",
      audience: "vendor",
      body: decision === "approved" ? `${updated.fileName} was approved for your public profile.` : note,
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: current.profile.organizationId,
      recipientUserId: recipient.id,
      title: decision === "approved" ? "Vendor image approved" : "Vendor image replacement requested",
      type: decision === "approved" ? "success" : "warning",
    }) : Promise.resolve(),
    recordAuditLog({
      action: `vendor_brand_asset.${decision}`,
      actorUserId: session.user?.id ?? null,
      entityId: assetId,
      entityType: "vendor_brand_asset",
      metadata: { fileName: updated.fileName, fromStatus: current.asset.status, note, organizationId: current.profile.organizationId },
    }),
  ]);
  revalidateVendorBranding(current.profile.slug);
  return result(`Image ${decision}.`, "success");
}

export async function reviewVendorBrandProfileAction(
  _previousState: VendorBrandReviewState,
  formData: FormData,
): Promise<VendorBrandReviewState> {
  const session = await requireAdminSection("vendor_branding");
  const profileId = clean(formData.get("profileId"), 100);
  const decision = clean(formData.get("decision"), 40) as "start_review" | "request_changes" | "approve" | "publish" | "unpublish";
  const note = clean(formData.get("reviewerNote"));
  if (!profileId || !["start_review", "request_changes", "approve", "publish", "unpublish"].includes(decision)) return result("Choose a profile decision.", "error");
  if (decision === "request_changes" && note.length < 10) return result("Explain the required changes in at least 10 characters.", "error");
  const current = await getVendorBrandProfileById(profileId);
  if (!current) return result("Vendor brand profile not found.", "error");
  const review = await reviewVendorBrandProfile({ decision, note, profileId, reviewerUserId: session.user?.id ?? null });
  if (review.error || !review.profile) return result(review.error ?? "The profile decision could not be saved.", "error");
  const recipient = await getVendorBrandRecipient(current.organizationId);
  const copy = {
    start_review: ["Vendor brand profile under review", note || "The content team has started reviewing your profile.", "info"],
    request_changes: ["Vendor brand profile changes requested", note, "warning"],
    approve: ["Vendor brand profile approved", note || "Your profile and approved media are ready for publication.", "success"],
    publish: ["Vendor profile published", "Your Vendor page is now visible in the public directory.", "success"],
    unpublish: ["Vendor profile unpublished", note || "Your Vendor page has been removed from the public directory pending an update.", "warning"],
  }[decision];
  await Promise.all([
    recipient ? createNotification({
      actionHref: "/portal/brand-profile",
      audience: "vendor",
      body: copy[1],
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: current.organizationId,
      recipientUserId: recipient.id,
      title: copy[0],
      type: copy[2],
    }) : Promise.resolve(),
    recordAuditLog({
      action: `vendor_brand_profile.${decision}`,
      actorUserId: session.user?.id ?? null,
      entityId: profileId,
      entityType: "vendor_brand_profile",
      metadata: { fromStatus: current.status, note, organizationId: current.organizationId, toStatus: review.profile.status },
    }),
  ]);
  revalidateVendorBranding(review.profile.slug);
  return result(`Profile ${decision.replaceAll("_", " ")} saved.`, "success");
}
