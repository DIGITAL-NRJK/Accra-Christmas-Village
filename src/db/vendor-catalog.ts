import "server-only";

import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  vendorCategories,
  vendorCategoryGroups,
  vendorPackageEntitlements,
  vendorPackages,
  vendorPolicies,
} from "@/db/schema";

export async function listVendorCatalog() {
  if (!process.env.DATABASE_URL) {
    return { categories: [], entitlements: [], groups: [], packages: [], policies: [] };
  }
  const db = getDb();
  const [categories, entitlements, groups, packages, policies] = await Promise.all([
    db.select().from(vendorCategories).orderBy(asc(vendorCategories.sortOrder), asc(vendorCategories.name)),
    db.select().from(vendorPackageEntitlements).orderBy(asc(vendorPackageEntitlements.sortOrder), asc(vendorPackageEntitlements.label)),
    db.select().from(vendorCategoryGroups).orderBy(asc(vendorCategoryGroups.sortOrder), asc(vendorCategoryGroups.name)),
    db.select().from(vendorPackages).orderBy(asc(vendorPackages.vendorKind), asc(vendorPackages.boothWidthCm)),
    db.select().from(vendorPolicies).orderBy(asc(vendorPolicies.type), asc(vendorPolicies.version)),
  ]);
  return { categories, entitlements, groups, packages, policies };
}

export type SaveVendorCategoryGroupInput = {
  active: boolean;
  description: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export async function saveVendorCategoryGroup(id: string | null, input: SaveVendorCategoryGroupInput) {
  if (!process.env.DATABASE_URL) return id ?? crypto.randomUUID();
  const db = getDb();
  const recordId = id ?? crypto.randomUUID();
  if (id) {
    await db.update(vendorCategoryGroups).set({ ...input, updatedAt: new Date() }).where(eq(vendorCategoryGroups.id, id));
  } else {
    await db.insert(vendorCategoryGroups).values({ id: recordId, ...input });
  }
  return recordId;
}

export type SaveVendorCategoryInput = SaveVendorCategoryGroupInput & { groupId: string };

export async function saveVendorCategory(id: string | null, input: SaveVendorCategoryInput) {
  if (!process.env.DATABASE_URL) return id ?? crypto.randomUUID();
  const db = getDb();
  const recordId = id ?? crypto.randomUUID();
  if (id) {
    await db.update(vendorCategories).set({ ...input, updatedAt: new Date() }).where(eq(vendorCategories.id, id));
  } else {
    await db.insert(vendorCategories).values({ id: recordId, ...input });
  }
  return recordId;
}

export type SaveVendorPackageInput = {
  active: boolean;
  boothDepthCm: number;
  boothWidthCm: number;
  code: string;
  currency: string;
  description: string;
  name: string;
  priceMinor: number | null;
  published: boolean;
  tier: "standard" | "premium" | "platinum";
  updatedByUserId: string | null;
  vendorKind: "general" | "food";
};

export async function saveVendorPackage(id: string | null, input: SaveVendorPackageInput) {
  if (!process.env.DATABASE_URL) return id ?? crypto.randomUUID();
  const db = getDb();
  const recordId = id ?? crypto.randomUUID();
  if (id) {
    await db.update(vendorPackages).set({ ...input, updatedAt: new Date(), version: sql`${vendorPackages.version} + 1` }).where(eq(vendorPackages.id, id));
  } else {
    await db.insert(vendorPackages).values({ id: recordId, ...input });
  }
  return recordId;
}

export type SaveVendorEntitlementInput = {
  category: "equipment" | "infrastructure" | "operations" | "marketing" | "location";
  code: string;
  description: string;
  label: string;
  packageId: string;
  quantity: number;
  sortOrder: number;
  unit: string;
};

export async function saveVendorEntitlement(id: string | null, input: SaveVendorEntitlementInput) {
  if (!process.env.DATABASE_URL) return id ?? crypto.randomUUID();
  const db = getDb();
  const recordId = id ?? crypto.randomUUID();
  if (id) {
    await db.update(vendorPackageEntitlements).set({ ...input, updatedAt: new Date() }).where(eq(vendorPackageEntitlements.id, id));
  } else {
    await db.insert(vendorPackageEntitlements).values({ id: recordId, ...input });
  }
  return recordId;
}

export type SaveVendorPolicyInput = {
  active: boolean;
  body: string;
  effectiveFrom: string | null;
  title: string;
  type: "cancellation" | "operating_hours" | "security" | "setup";
  updatedByUserId: string | null;
};

export async function saveVendorPolicy(id: string | null, input: SaveVendorPolicyInput) {
  if (!process.env.DATABASE_URL) return id ?? crypto.randomUUID();
  const db = getDb();
  const recordId = crypto.randomUUID();
  let version = 1;
  if (id) {
    const [previous] = await db.select({ version: vendorPolicies.version }).from(vendorPolicies).where(eq(vendorPolicies.id, id)).limit(1);
    if (!previous) throw new Error("Policy not found");
    version = previous.version + 1;
    await db.update(vendorPolicies).set({ active: false, updatedAt: new Date() }).where(eq(vendorPolicies.id, id));
  }
  if (input.active) await db.update(vendorPolicies).set({ active: false, updatedAt: new Date() }).where(eq(vendorPolicies.type, input.type));
  await db.insert(vendorPolicies).values({ id: recordId, ...input, version });
  return recordId;
}

export async function archiveVendorCatalogRecord(type: "category" | "group" | "package" | "policy", id: string) {
  if (!process.env.DATABASE_URL || !id) return false;
  const db = getDb();
  if (type === "category") {
    const [row] = await db.update(vendorCategories).set({ active: false, updatedAt: new Date() }).where(eq(vendorCategories.id, id)).returning({ id: vendorCategories.id });
    return Boolean(row);
  }
  if (type === "group") {
    const [row] = await db.update(vendorCategoryGroups).set({ active: false, updatedAt: new Date() }).where(eq(vendorCategoryGroups.id, id)).returning({ id: vendorCategoryGroups.id });
    if (row) await db.update(vendorCategories).set({ active: false, updatedAt: new Date() }).where(eq(vendorCategories.groupId, id));
    return Boolean(row);
  }
  if (type === "package") {
    const [row] = await db.update(vendorPackages).set({ active: false, published: false, updatedAt: new Date() }).where(eq(vendorPackages.id, id)).returning({ id: vendorPackages.id });
    return Boolean(row);
  }
  const [row] = await db.update(vendorPolicies).set({ active: false, updatedAt: new Date() }).where(eq(vendorPolicies.id, id)).returning({ id: vendorPolicies.id });
  return Boolean(row);
}

export async function deleteVendorEntitlement(id: string) {
  if (!process.env.DATABASE_URL || !id) return false;
  const [row] = await getDb().delete(vendorPackageEntitlements).where(eq(vendorPackageEntitlements.id, id)).returning({ id: vendorPackageEntitlements.id });
  return Boolean(row);
}
