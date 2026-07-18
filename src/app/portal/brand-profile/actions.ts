"use server";

import { revalidatePath } from "next/cache";
import {
  addVendorBrandAsset,
  deleteVendorBrandAsset,
  getVendorBrandWorkspace,
  saveVendorBrandProfileDraft,
  submitVendorBrandProfile,
  type VendorBrandAssetKind,
} from "@/db/vendor-branding";
import { createNotification, recordAuditLog } from "@/db/queries";
import { getVendorPaymentByOrganization } from "@/db/vendor-payments";
import { requireAnyRole } from "@/lib/auth";
import { formatFileSize } from "@/lib/document-upload";
import { documentStorage } from "@/lib/storage";

export type VendorBrandActionState = { message: string; status: "idle" | "error" | "success" };

const maxBrandAssetBytes = 8 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const assetKinds: VendorBrandAssetKind[] = ["logo", "cover", "product"];

function state(message: string, status: VendorBrandActionState["status"]): VendorBrandActionState {
  return { message, status };
}

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeWebsite(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function isAllowedImage(file: File) {
  const name = file.name.toLowerCase();
  return allowedImageTypes.has(file.type) && allowedImageExtensions.some((extension) => name.endsWith(extension));
}

function revalidateBrandPaths(slug?: string) {
  revalidatePath("/admin/vendor-branding");
  revalidatePath("/portal");
  revalidatePath("/portal/brand-profile");
  revalidatePath("/portal/onboarding");
  revalidatePath("/stands");
  if (slug) revalidatePath(`/vendors/${slug}`);
}

export async function saveVendorBrandProfileAction(
  _previousState: VendorBrandActionState,
  formData: FormData,
): Promise<VendorBrandActionState> {
  const session = await requireAnyRole(["vendor"]);
  if (!session.user || !session.organization) return state("Vendor workspace not found.", "error");
  const websiteUrl = normalizeWebsite(clean(formData.get("websiteUrl"), 500));
  if (websiteUrl === null) return state("Enter a complete website URL beginning with http:// or https://.", "error");
  const result = await saveVendorBrandProfileDraft({
    instagramHandle: clean(formData.get("instagramHandle"), 120).replace(/^@+/, ""),
    organizationId: session.organization.id,
    productHighlights: clean(formData.get("productHighlights"), 2_000),
    slug: clean(formData.get("slug"), 100),
    socialPromotionConsent: formData.get("socialPromotionConsent") === "on",
    summary: clean(formData.get("summary"), 3_000),
    tagline: clean(formData.get("tagline"), 180),
    websiteUrl,
  });
  if (result.error || !result.profile) return state(result.error ?? "The profile could not be saved.", "error");
  await recordAuditLog({
    action: "vendor_brand_profile.saved",
    actorUserId: session.user.id,
    entityId: result.profile.id,
    entityType: "vendor_brand_profile",
    metadata: { organizationId: session.organization.id, slug: result.profile.slug },
  });
  revalidateBrandPaths(result.profile.slug);
  return state("Brand profile saved.", "success");
}

export async function uploadVendorBrandAssetAction(
  _previousState: VendorBrandActionState,
  formData: FormData,
): Promise<VendorBrandActionState> {
  const session = await requireAnyRole(["vendor"]);
  if (!session.user || !session.organization) return state("Vendor workspace not found.", "error");
  const kind = clean(formData.get("kind"), 20) as VendorBrandAssetKind;
  const file = formData.get("file");
  const altText = clean(formData.get("altText"), 240);
  if (!assetKinds.includes(kind)) return state("Choose a valid media type.", "error");
  if (!(file instanceof File) || file.size === 0) return state("Choose an image to upload.", "error");
  if (file.size > maxBrandAssetBytes) return state(`Upload an image smaller than ${formatFileSize(maxBrandAssetBytes)}.`, "error");
  if (!isAllowedImage(file)) return state("Upload a JPEG, PNG or WebP image.", "error");
  if (altText.length < 8) return state("Describe the image in at least 8 characters for accessibility.", "error");
  const workspace = await getVendorBrandWorkspace(session.organization.id);
  if (!workspace.profile || !["draft", "changes_requested"].includes(workspace.profile.status)) {
    return state("Save an editable brand profile before uploading media.", "error");
  }
  if (kind === "product" && workspace.assets.filter((asset) => asset.kind === "product").length >= 4) {
    return state("Delete a product image before adding another one.", "error");
  }
  let stored;
  try {
    stored = await documentStorage.put(file, {
      organizationId: session.organization.id,
      requirementId: `vendor-brand-${kind}`,
    });
  } catch (error) {
    console.error("Vendor brand asset upload failed.", { error, kind, organizationId: session.organization.id });
    return state("The image could not be stored. Try again.", "error");
  }
  const result = await addVendorBrandAsset({
    altText,
    contentType: stored.contentType,
    fileName: stored.fileName,
    fileSize: stored.size,
    kind,
    organizationId: session.organization.id,
    profileId: workspace.profile.id,
    storageKey: stored.key,
  });
  if (result.error || !result.asset) {
    await documentStorage.delete(stored.key).catch(() => undefined);
    return state(result.error ?? "The image could not be linked to this profile.", "error");
  }
  await Promise.all([
    ...result.replacedStorageKeys.map((key) => documentStorage.delete(key).catch(() => undefined)),
    recordAuditLog({
      action: "vendor_brand_asset.uploaded",
      actorUserId: session.user.id,
      entityId: result.asset.id,
      entityType: "vendor_brand_asset",
      metadata: { fileName: result.asset.fileName, kind, organizationId: session.organization.id },
    }),
  ]);
  revalidateBrandPaths(workspace.profile.slug);
  return state(`${kind === "product" ? "Product image" : kind === "cover" ? "Cover image" : "Logo"} uploaded for review.`, "success");
}

export async function deleteVendorBrandAssetAction(formData: FormData) {
  const session = await requireAnyRole(["vendor"]);
  if (!session.user || !session.organization) return;
  const assetId = clean(formData.get("assetId"), 100);
  const deleted = await deleteVendorBrandAsset(assetId, session.organization.id);
  if (!deleted) return;
  await Promise.all([
    documentStorage.delete(deleted.storageKey).catch(() => undefined),
    recordAuditLog({
      action: "vendor_brand_asset.deleted",
      actorUserId: session.user.id,
      entityId: deleted.id,
      entityType: "vendor_brand_asset",
      metadata: { fileName: deleted.fileName, organizationId: session.organization.id },
    }),
  ]);
  revalidateBrandPaths();
}

export async function submitVendorBrandProfileAction(
  _previousState: VendorBrandActionState,
  _formData: FormData,
): Promise<VendorBrandActionState> {
  void _previousState;
  void _formData;
  const session = await requireAnyRole(["vendor"]);
  if (!session.user || !session.organization) return state("Vendor workspace not found.", "error");
  const payment = await getVendorPaymentByOrganization(session.organization.id);
  if (payment?.status !== "paid") return state("Full package payment must be verified before the brand profile can be submitted.", "error");
  const result = await submitVendorBrandProfile(session.organization.id);
  if (result.error || !result.profile) return state(result.error ?? "The profile could not be submitted.", "error");
  await Promise.all([
    createNotification({
      actionHref: `/admin/vendor-branding?profile=${result.profile.id}`,
      audience: "internal",
      body: `${session.organization.name} submitted its public brand profile and media for review.`,
      createdByUserId: session.user.id,
      expiresAt: null,
      organizationId: null,
      title: "Vendor brand profile submitted",
      type: "info",
    }),
    recordAuditLog({
      action: "vendor_brand_profile.submitted",
      actorUserId: session.user.id,
      entityId: result.profile.id,
      entityType: "vendor_brand_profile",
      metadata: { organizationId: session.organization.id, slug: result.profile.slug },
    }),
  ]);
  revalidateBrandPaths(result.profile.slug);
  return state("Brand profile submitted. Organizers can now review every image and publish the page.", "success");
}
