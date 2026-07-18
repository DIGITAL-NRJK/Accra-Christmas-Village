import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  vendorApplications,
  vendorHandbookAcknowledgements,
  vendorHandbookSections,
  vendorHandbooks,
  vendors,
} from "@/db/schema";

export type VendorHandbookAudience = "all" | "general" | "food";
export type VendorHandbookSectionKind =
  | "setup"
  | "operating_hours"
  | "deliveries"
  | "power"
  | "waste"
  | "security"
  | "branding"
  | "food_safety"
  | "emergency"
  | "other";

export type VendorHandbookDraftInput = {
  effectiveFrom: string | null;
  summary: string;
  title: string;
};

export type VendorHandbookSectionInput = {
  audience: VendorHandbookAudience;
  body: string;
  handbookId: string;
  kind: VendorHandbookSectionKind;
  quickReference: string;
  required: boolean;
  sortOrder: number;
  title: string;
};

function sectionMatchesAudience(audience: VendorHandbookAudience, vendorKind: "general" | "food") {
  return audience === "all" || audience === vendorKind;
}

export async function listVendorHandbooks() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(vendorHandbooks).orderBy(desc(vendorHandbooks.version));
}

export async function getVendorHandbookById(handbookId: string) {
  if (!process.env.DATABASE_URL || !handbookId) return null;
  const db = getDb();
  const [handbook] = await db.select().from(vendorHandbooks).where(eq(vendorHandbooks.id, handbookId)).limit(1);
  if (!handbook) return null;
  const sections = await db
    .select()
    .from(vendorHandbookSections)
    .where(eq(vendorHandbookSections.handbookId, handbook.id))
    .orderBy(asc(vendorHandbookSections.sortOrder), asc(vendorHandbookSections.createdAt));
  return { handbook, sections };
}

export async function createVendorHandbook(input: VendorHandbookDraftInput & { createdByUserId: string | null }) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [latest] = await db.select({ version: vendorHandbooks.version }).from(vendorHandbooks).orderBy(desc(vendorHandbooks.version)).limit(1);
  const [created] = await db.insert(vendorHandbooks).values({
    ...input,
    id: crypto.randomUUID(),
    version: (latest?.version ?? 0) + 1,
  }).returning();
  return created ?? null;
}

export async function updateVendorHandbookDraft(handbookId: string, input: VendorHandbookDraftInput) {
  if (!process.env.DATABASE_URL) return null;
  const [updated] = await getDb().update(vendorHandbooks).set({ ...input, updatedAt: new Date() }).where(and(eq(vendorHandbooks.id, handbookId), eq(vendorHandbooks.status, "draft"))).returning();
  return updated ?? null;
}

export async function saveVendorHandbookSection(sectionId: string | null, input: VendorHandbookSectionInput) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [handbook] = await db.select({ status: vendorHandbooks.status }).from(vendorHandbooks).where(eq(vendorHandbooks.id, input.handbookId)).limit(1);
  if (handbook?.status !== "draft") return null;
  if (sectionId) {
    const [updated] = await db.update(vendorHandbookSections).set({ ...input, updatedAt: new Date() }).where(and(eq(vendorHandbookSections.id, sectionId), eq(vendorHandbookSections.handbookId, input.handbookId))).returning();
    return updated ?? null;
  }
  const [created] = await db.insert(vendorHandbookSections).values({ ...input, id: crypto.randomUUID() }).returning();
  return created ?? null;
}

export async function deleteVendorHandbookSection(sectionId: string, handbookId: string) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [handbook] = await db.select({ status: vendorHandbooks.status }).from(vendorHandbooks).where(eq(vendorHandbooks.id, handbookId)).limit(1);
  if (handbook?.status !== "draft") return null;
  const [deleted] = await db.delete(vendorHandbookSections).where(and(eq(vendorHandbookSections.id, sectionId), eq(vendorHandbookSections.handbookId, handbookId))).returning();
  return deleted ?? null;
}

export async function publishVendorHandbook(handbookId: string, publishedByUserId: string | null) {
  if (!process.env.DATABASE_URL) return { error: "The database is not configured.", handbook: null };
  const db = getDb();
  const workspace = await getVendorHandbookById(handbookId);
  if (!workspace || workspace.handbook.status !== "draft") return { error: "Only a draft handbook can be published.", handbook: null };
  if (!workspace.sections.some((section) => section.required)) return { error: "Add at least one required section before publishing.", handbook: null };
  const now = new Date();
  const published = await db.select({ id: vendorHandbooks.id }).from(vendorHandbooks).where(eq(vendorHandbooks.status, "published"));
  const operations = [
    ...published.map((item) => db.update(vendorHandbooks).set({ status: "archived", updatedAt: now }).where(eq(vendorHandbooks.id, item.id))),
    db.update(vendorHandbooks).set({ publishedAt: now, publishedByUserId, status: "published", updatedAt: now }).where(eq(vendorHandbooks.id, handbookId)),
  ];
  await db.batch(operations as [typeof operations[number], ...typeof operations]);
  const updated = await getVendorHandbookById(handbookId);
  return { error: null, handbook: updated?.handbook ?? null };
}

export async function cloneVendorHandbook(sourceId: string, createdByUserId: string | null) {
  if (!process.env.DATABASE_URL) return null;
  const source = await getVendorHandbookById(sourceId);
  if (!source) return null;
  const db = getDb();
  const [latest] = await db.select({ version: vendorHandbooks.version }).from(vendorHandbooks).orderBy(desc(vendorHandbooks.version)).limit(1);
  const handbookId = crypto.randomUUID();
  const [created] = await db.insert(vendorHandbooks).values({
    createdByUserId,
    effectiveFrom: source.handbook.effectiveFrom,
    id: handbookId,
    summary: source.handbook.summary,
    title: source.handbook.title,
    version: (latest?.version ?? 0) + 1,
  }).returning();
  if (!created) return null;
  if (source.sections.length > 0) {
    await db.insert(vendorHandbookSections).values(source.sections.map((section) => ({
      audience: section.audience,
      body: section.body,
      handbookId,
      id: crypto.randomUUID(),
      kind: section.kind,
      quickReference: section.quickReference,
      required: section.required,
      sortOrder: section.sortOrder,
      title: section.title,
    })));
  }
  return created;
}

export async function getActiveVendorHandbookForOrganization(organizationId: string, vendorKind: "general" | "food" = "general") {
  if (!process.env.DATABASE_URL || !organizationId) return null;
  const db = getDb();
  const [handbook] = await db.select().from(vendorHandbooks).where(eq(vendorHandbooks.status, "published")).orderBy(desc(vendorHandbooks.version)).limit(1);
  if (!handbook) return null;
  const [allSections, acknowledgements] = await Promise.all([
    db.select().from(vendorHandbookSections).where(eq(vendorHandbookSections.handbookId, handbook.id)).orderBy(asc(vendorHandbookSections.sortOrder), asc(vendorHandbookSections.createdAt)),
    db.select().from(vendorHandbookAcknowledgements).where(and(eq(vendorHandbookAcknowledgements.handbookId, handbook.id), eq(vendorHandbookAcknowledgements.organizationId, organizationId))),
  ]);
  const sections = allSections.filter((section) => sectionMatchesAudience(section.audience, vendorKind));
  return { acknowledgements, handbook, sections };
}

export async function acknowledgeVendorHandbookSection(input: {
  organizationId: string;
  sectionId: string;
  userId: string | null;
  vendorKind: "general" | "food";
}) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [row] = await db.select({ handbook: vendorHandbooks, section: vendorHandbookSections })
    .from(vendorHandbookSections)
    .innerJoin(vendorHandbooks, eq(vendorHandbookSections.handbookId, vendorHandbooks.id))
    .where(eq(vendorHandbookSections.id, input.sectionId))
    .limit(1);
  if (!row || row.handbook.status !== "published" || !row.section.required || !sectionMatchesAudience(row.section.audience, input.vendorKind)) return null;
  const [acknowledgement] = await db.insert(vendorHandbookAcknowledgements).values({
    acknowledgedByUserId: input.userId,
    handbookId: row.handbook.id,
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    sectionId: row.section.id,
  }).onConflictDoNothing({ target: [vendorHandbookAcknowledgements.sectionId, vendorHandbookAcknowledgements.organizationId] }).returning();
  return acknowledgement ?? true;
}

export async function getVendorHandbookOverview() {
  if (!process.env.DATABASE_URL) return { handbook: null, readyVendors: 0, requiredSections: 0, totalVendors: 0 };
  const db = getDb();
  const [handbook] = await db.select().from(vendorHandbooks).where(eq(vendorHandbooks.status, "published")).orderBy(desc(vendorHandbooks.version)).limit(1);
  if (!handbook) return { handbook: null, readyVendors: 0, requiredSections: 0, totalVendors: 0 };
  const [sections, acknowledgements, vendorRows, applicationRows] = await Promise.all([
    db.select().from(vendorHandbookSections).where(eq(vendorHandbookSections.handbookId, handbook.id)),
    db.select().from(vendorHandbookAcknowledgements).where(eq(vendorHandbookAcknowledgements.handbookId, handbook.id)),
    db.select({ organizationId: vendors.organizationId }).from(vendors).where(eq(vendors.approved, true)),
    db.select({ organizationId: vendorApplications.organizationId, vendorKind: vendorApplications.vendorKind }).from(vendorApplications),
  ]);
  const kindByOrganization = new Map(applicationRows.map((application) => [application.organizationId, application.vendorKind ?? "general"]));
  const acknowledgedByOrganization = new Map<string, Set<string>>();
  for (const acknowledgement of acknowledgements) {
    const acknowledged = acknowledgedByOrganization.get(acknowledgement.organizationId) ?? new Set<string>();
    acknowledged.add(acknowledgement.sectionId);
    acknowledgedByOrganization.set(acknowledgement.organizationId, acknowledged);
  }
  const readyVendors = vendorRows.filter((vendor) => {
    const vendorKind = kindByOrganization.get(vendor.organizationId) ?? "general";
    const required = sections.filter((section) => section.required && sectionMatchesAudience(section.audience, vendorKind));
    const acknowledged = acknowledgedByOrganization.get(vendor.organizationId) ?? new Set<string>();
    return required.length > 0 && required.every((section) => acknowledged.has(section.id));
  }).length;
  return {
    handbook,
    readyVendors,
    requiredSections: sections.filter((section) => section.required).length,
    totalVendors: vendorRows.length,
  };
}
