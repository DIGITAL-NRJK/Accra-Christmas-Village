import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  organizations,
  stands,
  users,
  vendorBrandAssets,
  vendorBrandProfiles,
  vendors,
  zones,
} from "@/db/schema";

export type VendorBrandAssetKind = "logo" | "cover" | "product";
export type VendorBrandAssetDecision = "approved" | "rejected";
export type VendorBrandProfileStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "published";

const editableStatuses: VendorBrandProfileStatus[] = ["draft", "changes_requested"];

export function normalizeVendorBrandSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getVendorBrandWorkspace(organizationId: string) {
  if (!process.env.DATABASE_URL || !organizationId) return { assets: [], profile: null, vendor: null };
  const db = getDb();
  const [profile, vendor] = await Promise.all([
    db.select().from(vendorBrandProfiles).where(eq(vendorBrandProfiles.organizationId, organizationId)).limit(1).then((rows) => rows[0] ?? null),
    db.select().from(vendors).where(eq(vendors.organizationId, organizationId)).limit(1).then((rows) => rows[0] ?? null),
  ]);
  const assets = profile
    ? await db.select().from(vendorBrandAssets).where(eq(vendorBrandAssets.profileId, profile.id)).orderBy(asc(vendorBrandAssets.kind), asc(vendorBrandAssets.createdAt))
    : [];
  return { assets, profile, vendor };
}

export async function getVendorBrandProfileById(profileId: string) {
  if (!process.env.DATABASE_URL || !profileId) return null;
  const [profile] = await getDb().select().from(vendorBrandProfiles).where(eq(vendorBrandProfiles.id, profileId)).limit(1);
  return profile ?? null;
}

export async function getVendorBrandAssetById(assetId: string) {
  if (!process.env.DATABASE_URL || !assetId) return null;
  const [row] = await getDb()
    .select({ asset: vendorBrandAssets, profile: vendorBrandProfiles })
    .from(vendorBrandAssets)
    .innerJoin(vendorBrandProfiles, eq(vendorBrandAssets.profileId, vendorBrandProfiles.id))
    .where(eq(vendorBrandAssets.id, assetId))
    .limit(1);
  return row ?? null;
}

export async function listVendorBrandProfiles() {
  if (!process.env.DATABASE_URL) return [];
  return getDb()
    .select({
      profile: vendorBrandProfiles,
      organizationName: organizations.name,
      tradingName: vendors.tradingName,
      category: vendors.category,
    })
    .from(vendorBrandProfiles)
    .innerJoin(organizations, eq(vendorBrandProfiles.organizationId, organizations.id))
    .leftJoin(vendors, eq(vendorBrandProfiles.organizationId, vendors.organizationId))
    .orderBy(desc(vendorBrandProfiles.updatedAt));
}

export async function listPublishedVendorBrandProfiles() {
  if (!process.env.DATABASE_URL) return [];
  const db = getDb();
  const profiles = await db.select().from(vendorBrandProfiles).where(eq(vendorBrandProfiles.status, "published")).orderBy(asc(vendorBrandProfiles.slug));
  if (profiles.length === 0) return [];
  const result = await Promise.all(profiles.map(async (profile) => {
    const [vendor, organization, assets] = await Promise.all([
      db.select().from(vendors).where(eq(vendors.organizationId, profile.organizationId)).limit(1).then((rows) => rows[0] ?? null),
      db.select({ status: organizations.status }).from(organizations).where(eq(organizations.id, profile.organizationId)).limit(1).then((rows) => rows[0] ?? null),
      db.select().from(vendorBrandAssets).where(and(eq(vendorBrandAssets.profileId, profile.id), eq(vendorBrandAssets.status, "approved"))).orderBy(asc(vendorBrandAssets.createdAt)),
    ]);
    return vendor?.approved && organization?.status === "active" ? { assets, profile, vendor } : null;
  }));
  return result.filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function getPublishedVendorBrandProfile(slug: string) {
  if (!process.env.DATABASE_URL || !slug) return null;
  const db = getDb();
  const [profile] = await db.select().from(vendorBrandProfiles).where(and(eq(vendorBrandProfiles.slug, slug), eq(vendorBrandProfiles.status, "published"))).limit(1);
  if (!profile) return null;
  const [vendor, organization, assets] = await Promise.all([
    db.select().from(vendors).where(eq(vendors.organizationId, profile.organizationId)).limit(1).then((rows) => rows[0] ?? null),
    db.select().from(organizations).where(eq(organizations.id, profile.organizationId)).limit(1).then((rows) => rows[0] ?? null),
    db.select().from(vendorBrandAssets).where(and(eq(vendorBrandAssets.profileId, profile.id), eq(vendorBrandAssets.status, "approved"))).orderBy(asc(vendorBrandAssets.createdAt)),
  ]);
  if (!vendor?.approved || !organization || organization.status !== "active") return null;
  const [stand, zone] = vendor.standId
    ? await db.select({ stand: stands, zone: zones }).from(stands).innerJoin(zones, eq(stands.zoneId, zones.id)).where(eq(stands.id, vendor.standId)).limit(1).then((rows) => rows[0] ? [rows[0].stand, rows[0].zone] : [null, null])
    : [null, null];
  return { assets, organization, profile, stand, vendor, zone };
}

export async function saveVendorBrandProfileDraft(input: {
  instagramHandle: string;
  organizationId: string;
  productHighlights: string;
  slug: string;
  socialPromotionConsent: boolean;
  summary: string;
  tagline: string;
  websiteUrl: string;
}) {
  if (!process.env.DATABASE_URL) return { error: "The database is not configured.", profile: null };
  const db = getDb();
  const slug = normalizeVendorBrandSlug(input.slug);
  if (!slug) return { error: "Choose a public URL slug.", profile: null };
  const [existing, slugOwner] = await Promise.all([
    db.select().from(vendorBrandProfiles).where(eq(vendorBrandProfiles.organizationId, input.organizationId)).limit(1).then((rows) => rows[0] ?? null),
    db.select({ id: vendorBrandProfiles.id }).from(vendorBrandProfiles).where(eq(vendorBrandProfiles.slug, slug)).limit(1).then((rows) => rows[0] ?? null),
  ]);
  const [vendor] = await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.organizationId, input.organizationId)).limit(1);
  if (!vendor) return { error: "An approved Vendor record is required before creating a public profile.", profile: null };
  if (slugOwner && slugOwner.id !== existing?.id) return { error: "This public URL is already used by another Vendor.", profile: null };
  if (existing && !editableStatuses.includes(existing.status)) return { error: "This profile is locked while organizers review or publish it.", profile: null };
  const values = {
    instagramHandle: input.instagramHandle,
    productHighlights: input.productHighlights,
    slug,
    socialPromotionConsent: input.socialPromotionConsent,
    summary: input.summary,
    tagline: input.tagline,
    websiteUrl: input.websiteUrl,
    updatedAt: new Date(),
  };
  if (existing) {
    const [profile] = await db.update(vendorBrandProfiles).set(values).where(eq(vendorBrandProfiles.id, existing.id)).returning();
    return { error: null, profile: profile ?? null };
  }
  const [profile] = await db.insert(vendorBrandProfiles).values({ id: crypto.randomUUID(), organizationId: input.organizationId, ...values }).returning();
  return { error: null, profile: profile ?? null };
}

export async function addVendorBrandAsset(input: {
  altText: string;
  contentType: string;
  fileName: string;
  fileSize: number;
  kind: VendorBrandAssetKind;
  organizationId: string;
  profileId: string;
  storageKey: string;
}) {
  if (!process.env.DATABASE_URL) return { asset: null, error: "The database is not configured.", replacedStorageKeys: [] as string[] };
  const db = getDb();
  const [profile] = await db.select().from(vendorBrandProfiles).where(and(eq(vendorBrandProfiles.id, input.profileId), eq(vendorBrandProfiles.organizationId, input.organizationId))).limit(1);
  if (!profile || !editableStatuses.includes(profile.status)) return { asset: null, error: "This profile is not accepting media changes.", replacedStorageKeys: [] as string[] };
  const existing = await db.select().from(vendorBrandAssets).where(and(eq(vendorBrandAssets.profileId, profile.id), eq(vendorBrandAssets.kind, input.kind)));
  if (input.kind === "product" && existing.length >= 4) return { asset: null, error: "Delete a product image before adding another one.", replacedStorageKeys: [] as string[] };
  const replacedStorageKeys = input.kind === "product" ? [] : existing.map((asset) => asset.storageKey);
  if (input.kind !== "product" && existing.length) {
    await db.delete(vendorBrandAssets).where(and(eq(vendorBrandAssets.profileId, profile.id), eq(vendorBrandAssets.kind, input.kind)));
  }
  const [asset] = await db.insert(vendorBrandAssets).values({
    altText: input.altText,
    contentType: input.contentType,
    fileName: input.fileName,
    fileSize: input.fileSize,
    id: crypto.randomUUID(),
    kind: input.kind,
    profileId: profile.id,
    storageKey: input.storageKey,
  }).returning();
  await db.update(vendorBrandProfiles).set({ updatedAt: new Date() }).where(eq(vendorBrandProfiles.id, profile.id));
  return { asset: asset ?? null, error: null, replacedStorageKeys };
}

export async function deleteVendorBrandAsset(assetId: string, organizationId: string) {
  const row = await getVendorBrandAssetById(assetId);
  if (!row || row.profile.organizationId !== organizationId || !editableStatuses.includes(row.profile.status)) return null;
  await getDb().delete(vendorBrandAssets).where(eq(vendorBrandAssets.id, assetId));
  return row.asset;
}

export async function submitVendorBrandProfile(organizationId: string) {
  const workspace = await getVendorBrandWorkspace(organizationId);
  const { assets, profile } = workspace;
  if (!profile || !editableStatuses.includes(profile.status)) return { error: "This profile cannot be submitted in its current state.", profile: null };
  if (profile.tagline.trim().length < 8 || profile.summary.trim().length < 80 || profile.productHighlights.trim().length < 20) {
    return { error: "Complete the tagline, public story and product highlights before submitting.", profile: null };
  }
  if (!profile.socialPromotionConsent) return { error: "Confirm that the approved content may be used in the event directory and promotions.", profile: null };
  if (!assets.some((asset) => asset.kind === "logo" && asset.status !== "rejected")) return { error: "Upload a logo before submitting.", profile: null };
  if (!assets.some((asset) => ["cover", "product"].includes(asset.kind) && asset.status !== "rejected")) return { error: "Upload at least one showcase image before submitting.", profile: null };
  const [updated] = await getDb().update(vendorBrandProfiles).set({ reviewerNote: "", status: "submitted", submittedAt: new Date(), updatedAt: new Date() }).where(eq(vendorBrandProfiles.id, profile.id)).returning();
  return { error: null, profile: updated ?? null };
}

export async function reviewVendorBrandAsset(input: {
  assetId: string;
  decision: VendorBrandAssetDecision;
  note: string;
  reviewerUserId: string | null;
}) {
  if (!process.env.DATABASE_URL) return null;
  const [updated] = await getDb().update(vendorBrandAssets).set({ reviewerNote: input.note, reviewedAt: new Date(), reviewedByUserId: input.reviewerUserId, status: input.decision }).where(eq(vendorBrandAssets.id, input.assetId)).returning();
  return updated ?? null;
}

export async function reviewVendorBrandProfile(input: {
  decision: "start_review" | "request_changes" | "approve" | "publish" | "unpublish";
  note: string;
  profileId: string;
  reviewerUserId: string | null;
}) {
  if (!process.env.DATABASE_URL) return { error: "The database is not configured.", profile: null };
  const db = getDb();
  const [profile] = await db.select().from(vendorBrandProfiles).where(eq(vendorBrandProfiles.id, input.profileId)).limit(1);
  if (!profile) return { error: "Vendor brand profile not found.", profile: null };
  const assets = await db.select().from(vendorBrandAssets).where(eq(vendorBrandAssets.profileId, profile.id));
  let status: VendorBrandProfileStatus;
  if (input.decision === "start_review") {
    if (profile.status !== "submitted") return { error: "Only a submitted profile can enter review.", profile: null };
    status = "under_review";
  } else if (input.decision === "request_changes") {
    if (!["submitted", "under_review"].includes(profile.status)) return { error: "This profile is not awaiting review.", profile: null };
    status = "changes_requested";
  } else if (input.decision === "approve") {
    if (!["submitted", "under_review"].includes(profile.status)) return { error: "This profile is not awaiting approval.", profile: null };
    const hasApprovedLogo = assets.some((asset) => asset.kind === "logo" && asset.status === "approved");
    const hasApprovedShowcase = assets.some((asset) => ["cover", "product"].includes(asset.kind) && asset.status === "approved");
    if (!hasApprovedLogo || !hasApprovedShowcase || assets.some((asset) => asset.status === "submitted")) {
      return { error: "Approve the logo and a showcase image, and decide every submitted asset first.", profile: null };
    }
    status = "approved";
  } else if (input.decision === "publish") {
    if (profile.status !== "approved") return { error: "Approve the profile before publishing it.", profile: null };
    status = "published";
  } else {
    if (profile.status !== "published") return { error: "Only a published profile can be unpublished.", profile: null };
    status = "approved";
  }
  const now = new Date();
  const [updated] = await db.update(vendorBrandProfiles).set({
    publishedAt: status === "published" ? now : profile.publishedAt,
    reviewedAt: now,
    reviewedByUserId: input.reviewerUserId,
    reviewerNote: input.note,
    status,
    updatedAt: now,
  }).where(eq(vendorBrandProfiles.id, profile.id)).returning();
  return { error: null, profile: updated ?? null };
}

export async function getVendorBrandRecipient(organizationId: string) {
  if (!process.env.DATABASE_URL || !organizationId) return null;
  const [user] = await getDb().select({ id: users.id }).from(users).where(and(eq(users.organizationId, organizationId), eq(users.role, "vendor"))).limit(1);
  return user ?? null;
}
