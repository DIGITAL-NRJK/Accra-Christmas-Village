import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  accessRequests,
  vendorApplicationPolicyAcceptances,
  vendorApplications,
  vendorCategories,
  vendorCategoryGroups,
  vendorPackageEntitlements,
  vendorPackages,
  vendorPolicies,
  vendors,
} from "@/db/schema";

export type VendorApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn";

export type VendorApplicationDraft = Partial<{
  businessDescription: string;
  categoryId: string | null;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  instagramHandle: string;
  operationsContactEmail: string;
  operationsContactName: string;
  operationsContactPhone: string;
  organizationName: string;
  packageId: string | null;
  productsSummary: string;
  tradingName: string;
  websiteUrl: string;
}>;

export async function getVendorApplicationCatalog() {
  if (!process.env.DATABASE_URL) {
    return { categories: [], entitlements: [], groups: [], packages: [], policies: [] };
  }

  const db = getDb();
  const [categories, entitlements, groups, packages, policies] = await Promise.all([
    db.select().from(vendorCategories).orderBy(asc(vendorCategories.sortOrder), asc(vendorCategories.name)),
    db.select().from(vendorPackageEntitlements).orderBy(asc(vendorPackageEntitlements.sortOrder)),
    db.select().from(vendorCategoryGroups).orderBy(asc(vendorCategoryGroups.sortOrder), asc(vendorCategoryGroups.name)),
    db.select().from(vendorPackages).orderBy(asc(vendorPackages.vendorKind), asc(vendorPackages.boothWidthCm)),
    db.select().from(vendorPolicies).orderBy(asc(vendorPolicies.type), desc(vendorPolicies.version)),
  ]);

  const activeGroups = groups.filter((group) => group.active);
  const activeGroupIds = new Set(activeGroups.map((group) => group.id));
  const activeCategories = categories.filter((category) => category.active && activeGroupIds.has(category.groupId));
  const selectablePackages = packages.filter(
    (vendorPackage) => vendorPackage.active && vendorPackage.published && vendorPackage.priceMinor !== null && vendorPackage.priceMinor > 0,
  );
  const selectablePackageIds = new Set(selectablePackages.map((vendorPackage) => vendorPackage.id));

  return {
    categories: activeCategories,
    entitlements: entitlements.filter((entitlement) => selectablePackageIds.has(entitlement.packageId)),
    groups: activeGroups,
    packages: selectablePackages,
    policies: policies.filter((policy) => policy.active),
  };
}

async function withAcceptances(application: typeof vendorApplications.$inferSelect | null) {
  if (!application || !process.env.DATABASE_URL) return application ? { ...application, acceptances: [] } : null;
  const acceptances = await getDb()
    .select()
    .from(vendorApplicationPolicyAcceptances)
    .where(eq(vendorApplicationPolicyAcceptances.applicationId, application.id))
    .orderBy(asc(vendorApplicationPolicyAcceptances.policyType));
  return { ...application, acceptances };
}

export async function getVendorApplicationByClerkUser(clerkUserId: string) {
  if (!process.env.DATABASE_URL || !clerkUserId) return null;
  const [application] = await getDb().select().from(vendorApplications).where(eq(vendorApplications.clerkUserId, clerkUserId)).limit(1);
  return withAcceptances(application ?? null);
}

export async function getVendorApplicationByOrganization(organizationId: string) {
  if (!process.env.DATABASE_URL || !organizationId) return null;
  const [application] = await getDb().select().from(vendorApplications).where(eq(vendorApplications.organizationId, organizationId)).limit(1);
  return withAcceptances(application ?? null);
}

export async function getVendorApplicationById(applicationId: string) {
  if (!process.env.DATABASE_URL || !applicationId) return null;
  const [application] = await getDb().select().from(vendorApplications).where(eq(vendorApplications.id, applicationId)).limit(1);
  return withAcceptances(application ?? null);
}

export async function listVendorApplications() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(vendorApplications).orderBy(desc(vendorApplications.updatedAt));
}

export async function saveVendorApplicationDraft(input: {
  applicantUserId: string | null;
  clerkUserId: string;
  completedStep: number;
  defaults: { contactEmail: string; contactName: string };
  values: VendorApplicationDraft;
}) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [existing] = await db.select().from(vendorApplications).where(eq(vendorApplications.clerkUserId, input.clerkUserId)).limit(1);

  if (existing && !["draft", "changes_requested", "rejected"].includes(existing.status)) {
    throw new Error("This application can no longer be edited.");
  }

  const now = new Date();
  if (existing) {
    const [updated] = await db
      .update(vendorApplications)
      .set({
        ...input.values,
        applicantUserId: input.applicantUserId,
        currentStep: Math.max(existing.currentStep, Math.min(input.completedStep + 1, 6)),
        status: existing.status === "rejected" ? "draft" : existing.status,
        updatedAt: now,
      })
      .where(eq(vendorApplications.id, existing.id))
      .returning();
    return updated ?? null;
  }

  const [created] = await db.insert(vendorApplications).values({
    id: crypto.randomUUID(),
    applicantUserId: input.applicantUserId,
    clerkUserId: input.clerkUserId,
    contactEmail: input.defaults.contactEmail,
    contactName: input.defaults.contactName,
    currentStep: Math.min(input.completedStep + 1, 6),
    ...input.values,
  }).returning();
  return created ?? null;
}

export type SubmitVendorApplicationResult =
  | { applicationId: string; status: "success" }
  | { message: string; status: "error" };

export async function submitVendorApplication(input: {
  acceptedPolicyIds: string[];
  applicantUserId: string | null;
  clerkUserId: string;
  email: string;
}): Promise<SubmitVendorApplicationResult> {
  if (!process.env.DATABASE_URL) return { message: "The database is not configured.", status: "error" };
  const db = getDb();
  const [application] = await db.select().from(vendorApplications).where(eq(vendorApplications.clerkUserId, input.clerkUserId)).limit(1);
  if (!application) return { message: "Save your application before submitting it.", status: "error" };
  if (!["draft", "changes_requested", "rejected"].includes(application.status)) {
    return { message: "This application has already been submitted.", status: "error" };
  }

  const requiredText = [
    application.organizationName,
    application.tradingName,
    application.businessDescription,
    application.productsSummary,
    application.contactName,
    application.contactEmail,
    application.contactPhone,
    application.operationsContactName,
    application.operationsContactEmail,
    application.operationsContactPhone,
  ];
  if (requiredText.some((value) => !value.trim()) || !application.categoryId || !application.packageId) {
    return { message: "Complete every required section before submitting.", status: "error" };
  }

  const [category, selectedPackage, activePolicies, existingAccessRequest] = await Promise.all([
    db.select().from(vendorCategories).where(eq(vendorCategories.id, application.categoryId)).limit(1).then((rows) => rows[0] ?? null),
    db.select().from(vendorPackages).where(eq(vendorPackages.id, application.packageId)).limit(1).then((rows) => rows[0] ?? null),
    db.select().from(vendorPolicies).where(eq(vendorPolicies.active, true)),
    db.select().from(accessRequests).where(eq(accessRequests.clerkUserId, input.clerkUserId)).limit(1).then((rows) => rows[0] ?? null),
  ]);
  if (!category?.active) return { message: "The selected category is no longer available.", status: "error" };
  const [group] = await db.select().from(vendorCategoryGroups).where(eq(vendorCategoryGroups.id, category.groupId)).limit(1);
  if (!group?.active) return { message: "The selected category group is no longer available.", status: "error" };
  const expectedKind = group.slug === "food-beverage" ? "food" : "general";
  if (!selectedPackage?.active || !selectedPackage.published || !selectedPackage.priceMinor || selectedPackage.vendorKind !== expectedKind) {
    return { message: "The selected package is not available for this Vendor category.", status: "error" };
  }
  if (activePolicies.length === 0 || activePolicies.some((policy) => !input.acceptedPolicyIds.includes(policy.id))) {
    return { message: "Accept every current Vendor policy before submitting.", status: "error" };
  }
  if (existingAccessRequest && existingAccessRequest.requestedRole !== "vendor" && !["rejected", "cancelled"].includes(existingAccessRequest.status)) {
    return { message: `Your existing ${existingAccessRequest.requestedRole} access request must be cancelled first.`, status: "error" };
  }

  const requestId = existingAccessRequest?.id ?? crypto.randomUUID();
  if (!existingAccessRequest || existingAccessRequest.status !== "approved") {
    await db.insert(accessRequests).values({
      id: requestId,
      clerkUserId: input.clerkUserId,
      email: input.email,
      requestedRole: "vendor",
      organizationName: application.organizationName,
      contactName: application.contactName,
      phone: application.contactPhone,
      message: `Vendor application: ${application.tradingName}`,
      status: "pending",
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: accessRequests.clerkUserId,
      set: {
        cancellationReason: null,
        cancelledAt: null,
        contactName: application.contactName,
        email: input.email,
        message: `Vendor application: ${application.tradingName}`,
        organizationName: application.organizationName,
        phone: application.contactPhone,
        requestedRole: "vendor",
        reviewedAt: null,
        reviewerNote: null,
        status: "pending",
        updatedAt: new Date(),
      },
    });
  }

  await db.delete(vendorApplicationPolicyAcceptances).where(eq(vendorApplicationPolicyAcceptances.applicationId, application.id));
  await db.insert(vendorApplicationPolicyAcceptances).values(activePolicies.map((policy) => ({
    acceptedByUserId: input.applicantUserId,
    applicationId: application.id,
    id: crypto.randomUUID(),
    policyBody: policy.body,
    policyId: policy.id,
    policyTitle: policy.title,
    policyType: policy.type,
    policyVersion: policy.version,
  })));
  await db.update(vendorApplications).set({
    accessRequestId: requestId,
    applicantUserId: input.applicantUserId,
    categorySnapshot: { group: group.name, id: category.id, name: category.name, slug: category.slug },
    currentStep: 6,
    packageSnapshot: {
      boothDepthCm: selectedPackage.boothDepthCm,
      boothWidthCm: selectedPackage.boothWidthCm,
      code: selectedPackage.code,
      currency: selectedPackage.currency,
      id: selectedPackage.id,
      name: selectedPackage.name,
      priceMinor: selectedPackage.priceMinor,
      tier: selectedPackage.tier,
    },
    packageVersion: selectedPackage.version,
    reviewerNote: null,
    status: "submitted",
    submittedAt: new Date(),
    updatedAt: new Date(),
    vendorKind: expectedKind,
  }).where(eq(vendorApplications.id, application.id));

  return { applicationId: application.id, status: "success" };
}

export async function updateVendorApplicationReview(input: {
  applicationId: string;
  note: string;
  reviewerUserId: string | null;
  status: Extract<VendorApplicationStatus, "under_review" | "changes_requested" | "rejected">;
}) {
  if (!process.env.DATABASE_URL) return false;
  const [updated] = await getDb().update(vendorApplications).set({
    reviewedAt: new Date(),
    reviewedByUserId: input.reviewerUserId,
    reviewerNote: input.note,
    status: input.status,
    updatedAt: new Date(),
  }).where(eq(vendorApplications.id, input.applicationId)).returning({ id: vendorApplications.id });
  return Boolean(updated);
}

export async function approveVendorApplication(input: {
  applicationId: string;
  note: string;
  organizationId: string;
  reviewerUserId: string | null;
}) {
  if (!process.env.DATABASE_URL) return false;
  const application = await getVendorApplicationById(input.applicationId);
  if (!application) return false;
  const db = getDb();
  await db.update(vendors).set({
    approved: true,
    category: String(application.categorySnapshot?.name ?? "Vendor"),
    categoryId: application.categoryId,
    packageId: application.packageId,
    tradingName: application.tradingName,
    vendorKind: application.vendorKind ?? "general",
  }).where(eq(vendors.organizationId, input.organizationId));
  const [updated] = await db.update(vendorApplications).set({
    organizationId: input.organizationId,
    reviewedAt: new Date(),
    reviewedByUserId: input.reviewerUserId,
    reviewerNote: input.note,
    status: "approved",
    updatedAt: new Date(),
  }).where(eq(vendorApplications.id, input.applicationId)).returning({ id: vendorApplications.id });
  return Boolean(updated);
}
