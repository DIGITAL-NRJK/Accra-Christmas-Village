"use server";

import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/db/queries";
import {
  archiveVendorCatalogRecord,
  deleteVendorEntitlement,
  listVendorCatalog,
  saveVendorCategory,
  saveVendorCategoryGroup,
  saveVendorEntitlement,
  saveVendorPackage,
  saveVendorPolicy,
} from "@/db/vendor-catalog";
import { requireAdminSection } from "@/lib/admin-rbac";

export type CatalogActionState = { message: string; status: "idle" | "error" | "success" };
const packageTiers = ["standard", "premium", "platinum"] as const;
const vendorKinds = ["general", "food"] as const;
const entitlementCategories = ["equipment", "infrastructure", "operations", "marketing", "location"] as const;
const policyTypes = ["cancellation", "operating_hours", "security", "setup"] as const;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function limitedText(formData: FormData, name: string, maximum: number) {
  return text(formData, name).slice(0, maximum);
}

function normalizedSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function integer(formData: FormData, name: string, minimum: number, maximum: number) {
  const value = Number.parseInt(text(formData, name), 10);
  return Number.isInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function refreshCatalog() {
  revalidatePath("/admin");
  revalidatePath("/admin/vendor-catalog");
  revalidatePath("/admin/vendors");
}

export async function saveCategoryGroupAction(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "groupId") || null;
  const name = limitedText(formData, "name", 100);
  const slug = normalizedSlug(text(formData, "slug") || name);
  const sortOrder = integer(formData, "sortOrder", 0, 10_000);
  if (!name || !slug || sortOrder === null) return { message: "Enter a group name and valid display order.", status: "error" };
  const catalog = await listVendorCatalog();
  if (id && !catalog.groups.some((group) => group.id === id)) return { message: "This category group no longer exists.", status: "error" };
  const previous = id ? catalog.groups.find((group) => group.id === id) ?? null : null;
  try {
    const recordId = await saveVendorCategoryGroup(id, { active: formData.get("active") === "on", description: limitedText(formData, "description", 500), name, slug, sortOrder });
    await recordAuditLog({ action: id ? "vendor_category_group.updated" : "vendor_category_group.created", actorUserId: session.user?.id ?? null, entityId: recordId, entityType: "vendor_category_group", metadata: { before: previous, after: { active: formData.get("active") === "on", name, slug, sortOrder } } });
    refreshCatalog();
    return { message: id ? "Category group updated." : "Category group created.", status: "success" };
  } catch {
    return { message: "The category group could not be saved. Check that its slug is unique.", status: "error" };
  }
}

export async function saveCategoryAction(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "categoryId") || null;
  const groupId = text(formData, "groupId");
  const name = limitedText(formData, "name", 100);
  const slug = normalizedSlug(text(formData, "slug") || name);
  const sortOrder = integer(formData, "sortOrder", 0, 10_000);
  const catalog = await listVendorCatalog();
  if (!catalog.groups.some((group) => group.id === groupId)) return { message: "Choose an existing category group.", status: "error" };
  if (id && !catalog.categories.some((category) => category.id === id)) return { message: "This category no longer exists.", status: "error" };
  const previous = id ? catalog.categories.find((category) => category.id === id) ?? null : null;
  if (!name || !slug || sortOrder === null) return { message: "Enter a category name and valid display order.", status: "error" };
  try {
    const recordId = await saveVendorCategory(id, { active: formData.get("active") === "on", description: limitedText(formData, "description", 500), groupId, name, slug, sortOrder });
    await recordAuditLog({ action: id ? "vendor_category.updated" : "vendor_category.created", actorUserId: session.user?.id ?? null, entityId: recordId, entityType: "vendor_category", metadata: { before: previous, after: { active: formData.get("active") === "on", groupId, name, slug, sortOrder } } });
    refreshCatalog();
    return { message: id ? "Category updated." : "Category created.", status: "success" };
  } catch {
    return { message: "The category could not be saved. Check that its slug is unique.", status: "error" };
  }
}

function parsePriceMinor(value: string) {
  if (!value) return null;
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) return Number.NaN;
  return Math.round(Number(value) * 100);
}

export async function savePackageAction(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "packageId") || null;
  const name = limitedText(formData, "name", 120);
  const code = text(formData, "code").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
  const vendorKind = text(formData, "vendorKind") as (typeof vendorKinds)[number];
  const tier = text(formData, "tier") as (typeof packageTiers)[number];
  const boothWidthCm = integer(formData, "boothWidthCm", 100, 2_000);
  const boothDepthCm = integer(formData, "boothDepthCm", 100, 2_000);
  const priceMinor = parsePriceMinor(text(formData, "price"));
  const active = formData.get("active") === "on";
  const published = formData.get("published") === "on";
  if (!name || !code || !vendorKinds.includes(vendorKind) || !packageTiers.includes(tier) || boothWidthCm === null || boothDepthCm === null || Number.isNaN(priceMinor)) return { message: "Complete the package identity, kind, tier, dimensions and valid GHS price.", status: "error" };
  if (published && (!active || priceMinor === null || priceMinor <= 0)) return { message: "A published package must be active and have a price greater than zero.", status: "error" };
  const catalog = await listVendorCatalog();
  if (id && !catalog.packages.some((vendorPackage) => vendorPackage.id === id)) return { message: "This package no longer exists.", status: "error" };
  const previous = id ? catalog.packages.find((vendorPackage) => vendorPackage.id === id) ?? null : null;
  try {
    const recordId = await saveVendorPackage(id, { active, boothDepthCm, boothWidthCm, code, currency: "GHS", description: limitedText(formData, "description", 800), name, priceMinor, published, tier, updatedByUserId: session.user?.id ?? null, vendorKind });
    await recordAuditLog({ action: id ? "vendor_package.updated" : "vendor_package.created", actorUserId: session.user?.id ?? null, entityId: recordId, entityType: "vendor_package", metadata: { before: previous, after: { active, boothDepthCm, boothWidthCm, code, priceMinor, published, tier, vendorKind } } });
    refreshCatalog();
    return { message: id ? "Package updated." : "Package created.", status: "success" };
  } catch {
    return { message: "The package could not be saved. Check that its code is unique.", status: "error" };
  }
}

export async function saveEntitlementAction(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "entitlementId") || null;
  const packageId = text(formData, "packageId");
  const label = limitedText(formData, "label", 120);
  const code = normalizedSlug(text(formData, "code") || label);
  const category = text(formData, "category") as (typeof entitlementCategories)[number];
  const quantity = integer(formData, "quantity", 1, 10_000);
  const sortOrder = integer(formData, "sortOrder", 0, 10_000);
  const catalog = await listVendorCatalog();
  if (!catalog.packages.some((vendorPackage) => vendorPackage.id === packageId)) return { message: "Choose an existing package.", status: "error" };
  if (id && !catalog.entitlements.some((entitlement) => entitlement.id === id && entitlement.packageId === packageId)) return { message: "This package inclusion no longer exists.", status: "error" };
  const previous = id ? catalog.entitlements.find((entitlement) => entitlement.id === id) ?? null : null;
  if (!label || !code || !entitlementCategories.includes(category) || quantity === null || sortOrder === null) return { message: "Complete the inclusion label, category and quantity.", status: "error" };
  try {
    const recordId = await saveVendorEntitlement(id, { category, code, description: limitedText(formData, "description", 500), label, packageId, quantity, sortOrder, unit: limitedText(formData, "unit", 40) });
    await recordAuditLog({ action: id ? "vendor_package_entitlement.updated" : "vendor_package_entitlement.created", actorUserId: session.user?.id ?? null, entityId: recordId, entityType: "vendor_package_entitlement", metadata: { before: previous, after: { category, code, packageId, quantity, sortOrder } } });
    refreshCatalog();
    return { message: id ? "Package inclusion updated." : "Package inclusion added.", status: "success" };
  } catch {
    return { message: "The inclusion could not be saved. Its code must be unique within the package.", status: "error" };
  }
}

export async function savePolicyAction(_state: CatalogActionState, formData: FormData): Promise<CatalogActionState> {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "policyId") || null;
  const type = text(formData, "type") as (typeof policyTypes)[number];
  const title = limitedText(formData, "title", 140);
  const body = limitedText(formData, "body", 4_000);
  const effectiveFrom = text(formData, "effectiveFrom") || null;
  if (!policyTypes.includes(type) || !title || !body || (effectiveFrom && !/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom))) return { message: "Complete the policy type, title, text and valid effective date.", status: "error" };
  const catalog = await listVendorCatalog();
  if (id && !catalog.policies.some((policy) => policy.id === id)) return { message: "This policy no longer exists.", status: "error" };
  const previous = id ? catalog.policies.find((policy) => policy.id === id) ?? null : null;
  const recordId = await saveVendorPolicy(id, { active: formData.get("active") === "on", body, effectiveFrom, title, type, updatedByUserId: session.user?.id ?? null });
  await recordAuditLog({ action: id ? "vendor_policy.updated" : "vendor_policy.created", actorUserId: session.user?.id ?? null, entityId: recordId, entityType: "vendor_policy", metadata: { before: previous, after: { active: formData.get("active") === "on", effectiveFrom, title, type } } });
  refreshCatalog();
  return { message: id ? "Policy updated and versioned." : "Policy created.", status: "success" };
}

export async function archiveCatalogRecordAction(formData: FormData) {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "recordId");
  const type = text(formData, "recordType") as "category" | "group" | "package" | "policy";
  if (!id || !["category", "group", "package", "policy"].includes(type)) return;
  const catalog = await listVendorCatalog();
  const record = type === "category" ? catalog.categories.find((item) => item.id === id) : type === "group" ? catalog.groups.find((item) => item.id === id) : type === "package" ? catalog.packages.find((item) => item.id === id) : catalog.policies.find((item) => item.id === id);
  if (!record) return;
  await archiveVendorCatalogRecord(type, id);
  await recordAuditLog({ action: `vendor_catalog.${type}.archived`, actorUserId: session.user?.id ?? null, entityId: id, entityType: `vendor_${type}`, metadata: { before: record, after: { active: false } } });
  refreshCatalog();
}

export async function deleteEntitlementAction(formData: FormData) {
  const session = await requireAdminSection("vendor_catalog");
  const id = text(formData, "entitlementId");
  const catalog = await listVendorCatalog();
  const entitlement = catalog.entitlements.find((item) => item.id === id);
  if (!entitlement) return;
  await deleteVendorEntitlement(id);
  await recordAuditLog({ action: "vendor_package_entitlement.deleted", actorUserId: session.user?.id ?? null, entityId: id, entityType: "vendor_package_entitlement", metadata: { before: entitlement, packageId: entitlement.packageId } });
  refreshCatalog();
}
