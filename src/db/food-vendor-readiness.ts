import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  documentRequirements,
  documents,
  organizations,
  stands,
  vendorHandbookAcknowledgements,
  vendorHandbookSections,
  vendorHandbooks,
  vendors,
} from "@/db/schema";

export async function listFoodVendorReadiness() {
  if (!process.env.DATABASE_URL) return { handbook: null, requirements: [], rows: [] };
  const db = getDb();
  const [foodVendors, requirementRows, handbook] = await Promise.all([
    db.select({ organization: organizations, stand: stands, vendor: vendors })
      .from(vendors)
      .innerJoin(organizations, eq(vendors.organizationId, organizations.id))
      .leftJoin(stands, eq(vendors.standId, stands.id))
      .where(eq(vendors.vendorKind, "food"))
      .orderBy(asc(vendors.tradingName)),
    db.select().from(documentRequirements).where(eq(documentRequirements.organizationType, "vendor")).orderBy(asc(documentRequirements.sortOrder)),
    db.select().from(vendorHandbooks).where(eq(vendorHandbooks.status, "published")).orderBy(desc(vendorHandbooks.version)).limit(1).then((rows) => rows[0] ?? null),
  ]);
  const requirements = requirementRows.filter((requirement) => requirement.required && requirement.appliesToVendorKinds.includes("food"));
  const organizationIds = foodVendors.map((row) => row.organization.id);
  const [documentRows, handbookSections, acknowledgementRows] = await Promise.all([
    organizationIds.length > 0 ? db.select().from(documents).where(inArray(documents.organizationId, organizationIds)) : Promise.resolve([]),
    handbook ? db.select().from(vendorHandbookSections).where(and(eq(vendorHandbookSections.handbookId, handbook.id), eq(vendorHandbookSections.kind, "food_safety"))).orderBy(asc(vendorHandbookSections.sortOrder)) : Promise.resolve([]),
    handbook && organizationIds.length > 0 ? db.select().from(vendorHandbookAcknowledgements).where(and(eq(vendorHandbookAcknowledgements.handbookId, handbook.id), inArray(vendorHandbookAcknowledgements.organizationId, organizationIds))) : Promise.resolve([]),
  ]);
  const requiredFoodSafetySections = handbookSections.filter((section) => section.required && (section.audience === "all" || section.audience === "food"));
  const now = new Date();
  const rows = foodVendors.map(({ organization, stand, vendor }) => {
    const evidence = requirements.map((requirement) => {
      const document = documentRows.find((item) => item.organizationId === organization.id && item.requirementId === requirement.id);
      const expired = Boolean(document?.status === "approved" && document.expiresAt && document.expiresAt < now);
      return { document, expired, requirement, status: expired ? "rejected" as const : document?.status ?? "missing" as const };
    });
    const acknowledgedSectionIds = new Set(acknowledgementRows.filter((item) => item.organizationId === organization.id).map((item) => item.sectionId));
    const handbookReady = requiredFoodSafetySections.length === 0 || requiredFoodSafetySections.every((section) => acknowledgedSectionIds.has(section.id));
    const regulatoryReady = evidence.length > 0 && evidence.every((item) => item.status === "approved");
    const reviewQueue = evidence.filter((item) => item.status === "submitted").length;
    const blocked = evidence.some((item) => item.status === "rejected");
    return {
      blocked,
      evidence,
      handbookConfirmed: requiredFoodSafetySections.filter((section) => acknowledgedSectionIds.has(section.id)).length,
      handbookReady,
      handbookRequired: requiredFoodSafetySections.length,
      operationalReady: regulatoryReady && handbookReady && Boolean(stand),
      organization,
      regulatoryReady,
      reviewQueue,
      stand,
      vendor,
    };
  });
  return { handbook, requirements, rows };
}

export async function getFoodVendorReadinessOverview() {
  const readiness = await listFoodVendorReadiness();
  return {
    blocked: readiness.rows.filter((row) => row.blocked).length,
    ready: readiness.rows.filter((row) => row.operationalReady).length,
    reviewQueue: readiness.rows.reduce((total, row) => total + row.reviewQueue, 0),
    total: readiness.rows.length,
  };
}
