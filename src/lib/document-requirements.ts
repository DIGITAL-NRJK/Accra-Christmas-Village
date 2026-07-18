import type { DocumentRequirement, Vendor } from "@/lib/types";

type RequirementTarget = Pick<DocumentRequirement, "appliesToCategories" | "appliesToVendorKinds">;
type VendorTarget = Pick<Vendor, "category" | "vendorKind"> | null | undefined;

export function documentRequirementAppliesToVendor(requirement: RequirementTarget, vendor: VendorTarget) {
  const categories = requirement.appliesToCategories ?? [];
  const vendorKinds = requirement.appliesToVendorKinds ?? [];
  if (!vendor) return categories.length === 0 && vendorKinds.length === 0;
  return (categories.length === 0 || categories.includes(vendor.category)) &&
    (vendorKinds.length === 0 || vendorKinds.includes(vendor.vendorKind));
}
