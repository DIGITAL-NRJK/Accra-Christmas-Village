"use server";

import { revalidatePath } from "next/cache";
import { createNotification, recordAuditLog } from "@/db/queries";
import {
  cloneVendorHandbook,
  createVendorHandbook,
  deleteVendorHandbookSection,
  getVendorHandbookById,
  publishVendorHandbook,
  saveVendorHandbookSection,
  updateVendorHandbookDraft,
  type VendorHandbookAudience,
  type VendorHandbookSectionKind,
} from "@/db/vendor-handbook";
import { requireAdminSection } from "@/lib/admin-rbac";

export type HandbookActionState = { message: string; status: "idle" | "error" | "success" };

const audiences = ["all", "general", "food"] as const;
const kinds = ["setup", "operating_hours", "deliveries", "power", "waste", "security", "branding", "food_safety", "emergency", "other"] as const;

function clean(formData: FormData, name: string, maximum = 4_000) {
  return String(formData.get(name) ?? "").trim().slice(0, maximum);
}

function refreshHandbook() {
  revalidatePath("/admin");
  revalidatePath("/admin/vendor-handbook");
  revalidatePath("/portal/handbook");
  revalidatePath("/portal/onboarding");
  revalidatePath("/portal/stand");
}

export async function saveHandbookAction(_state: HandbookActionState, formData: FormData): Promise<HandbookActionState> {
  const session = await requireAdminSection("vendor_handbook");
  const handbookId = clean(formData, "handbookId", 100) || null;
  const title = clean(formData, "title", 160);
  const summary = clean(formData, "summary", 800);
  const effectiveFrom = clean(formData, "effectiveFrom", 10) || null;
  if (title.length < 5 || summary.length < 20 || (effectiveFrom && !/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom))) {
    return { message: "Add a clear title, a summary of at least 20 characters and a valid effective date.", status: "error" };
  }
  const previous = handbookId ? await getVendorHandbookById(handbookId) : null;
  if (handbookId && previous?.handbook.status !== "draft") return { message: "Published handbook versions are read-only. Clone this version to make changes.", status: "error" };
  try {
    const saved = handbookId
      ? await updateVendorHandbookDraft(handbookId, { effectiveFrom, summary, title })
      : await createVendorHandbook({ createdByUserId: session.user?.id ?? null, effectiveFrom, summary, title });
    if (!saved) return { message: "The handbook draft could not be saved.", status: "error" };
    await recordAuditLog({
      action: handbookId ? "vendor_handbook.updated" : "vendor_handbook.created",
      actorUserId: session.user?.id ?? null,
      entityId: saved.id,
      entityType: "vendor_handbook",
      metadata: { after: { effectiveFrom, summary, title, version: saved.version }, before: previous?.handbook ?? null },
    });
    refreshHandbook();
    return { message: handbookId ? "Handbook details updated." : `Handbook version ${saved.version} created.`, status: "success" };
  } catch {
    return { message: "The handbook could not be saved. Refresh and try again.", status: "error" };
  }
}

export async function saveHandbookSectionAction(_state: HandbookActionState, formData: FormData): Promise<HandbookActionState> {
  const session = await requireAdminSection("vendor_handbook");
  const handbookId = clean(formData, "handbookId", 100);
  const sectionId = clean(formData, "sectionId", 100) || null;
  const title = clean(formData, "title", 160);
  const body = clean(formData, "body", 8_000);
  const quickReference = clean(formData, "quickReference", 240);
  const audience = clean(formData, "audience", 20) as VendorHandbookAudience;
  const kind = clean(formData, "kind", 40) as VendorHandbookSectionKind;
  const sortOrder = Number.parseInt(clean(formData, "sortOrder", 6), 10);
  if (!handbookId || title.length < 4 || body.length < 20 || !audiences.includes(audience) || !kinds.includes(kind) || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10_000) {
    return { message: "Complete the section title, instructions, audience, category and display order.", status: "error" };
  }
  const workspace = await getVendorHandbookById(handbookId);
  const previous = workspace?.sections.find((section) => section.id === sectionId) ?? null;
  if (!workspace || workspace.handbook.status !== "draft" || (sectionId && !previous)) return { message: "This draft section is no longer editable.", status: "error" };
  const saved = await saveVendorHandbookSection(sectionId, { audience, body, handbookId, kind, quickReference, required: formData.get("required") === "on", sortOrder, title });
  if (!saved) return { message: "The section could not be saved.", status: "error" };
  await recordAuditLog({
    action: sectionId ? "vendor_handbook_section.updated" : "vendor_handbook_section.created",
    actorUserId: session.user?.id ?? null,
    entityId: saved.id,
    entityType: "vendor_handbook_section",
    metadata: { after: { audience, handbookId, kind, required: saved.required, sortOrder, title }, before: previous },
  });
  refreshHandbook();
  return { message: sectionId ? "Section updated." : "Section added to the route.", status: "success" };
}

export async function deleteHandbookSectionAction(formData: FormData) {
  const session = await requireAdminSection("vendor_handbook");
  const handbookId = clean(formData, "handbookId", 100);
  const sectionId = clean(formData, "sectionId", 100);
  const workspace = await getVendorHandbookById(handbookId);
  const section = workspace?.sections.find((item) => item.id === sectionId);
  if (!section) return;
  const deleted = await deleteVendorHandbookSection(sectionId, handbookId);
  if (!deleted) return;
  await recordAuditLog({ action: "vendor_handbook_section.deleted", actorUserId: session.user?.id ?? null, entityId: sectionId, entityType: "vendor_handbook_section", metadata: { before: section, handbookId } });
  refreshHandbook();
}

export async function publishHandbookAction(_state: HandbookActionState, formData: FormData): Promise<HandbookActionState> {
  const session = await requireAdminSection("vendor_handbook");
  const handbookId = clean(formData, "handbookId", 100);
  const current = await getVendorHandbookById(handbookId);
  if (!current) return { message: "Handbook not found.", status: "error" };
  const published = await publishVendorHandbook(handbookId, session.user?.id ?? null);
  if (published.error || !published.handbook) return { message: published.error ?? "The handbook could not be published.", status: "error" };
  await Promise.all([
    createNotification({
      actionHref: "/portal/handbook",
      audience: "vendor",
      body: `${published.handbook.title} is now the current operational reference. Review and acknowledge every required section before setup.`,
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: null,
      recipientUserId: null,
      title: `Vendor handbook v${published.handbook.version} published`,
      type: "warning",
    }),
    recordAuditLog({ action: "vendor_handbook.published", actorUserId: session.user?.id ?? null, entityId: handbookId, entityType: "vendor_handbook", metadata: { fromStatus: current.handbook.status, requiredSections: current.sections.filter((section) => section.required).length, version: published.handbook.version } }),
  ]);
  refreshHandbook();
  return { message: `Version ${published.handbook.version} is live and Vendors have been notified.`, status: "success" };
}

export async function cloneHandbookAction(_state: HandbookActionState, formData: FormData): Promise<HandbookActionState> {
  const session = await requireAdminSection("vendor_handbook");
  const sourceId = clean(formData, "handbookId", 100);
  const source = await getVendorHandbookById(sourceId);
  if (!source) return { message: "Source handbook not found.", status: "error" };
  const cloned = await cloneVendorHandbook(sourceId, session.user?.id ?? null);
  if (!cloned) return { message: "The new draft could not be created.", status: "error" };
  await recordAuditLog({ action: "vendor_handbook.cloned", actorUserId: session.user?.id ?? null, entityId: cloned.id, entityType: "vendor_handbook", metadata: { sourceId, sourceVersion: source.handbook.version, version: cloned.version } });
  refreshHandbook();
  return { message: `Version ${cloned.version} draft created from version ${source.handbook.version}.`, status: "success" };
}
