"use server";

import { revalidatePath } from "next/cache";
import { createSponsorCommitment, deleteSponsorCommitment, recordAuditLog, updateSponsorCommitment, type SaveSponsorCommitmentInput } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export type CommitmentActionState = { message: string; status: "idle" | "error" | "success" };
const kinds = ["benefit", "deliverable"];
const statuses = ["planned", "waiting_sponsor", "received", "in_production", "delivered", "validated", "blocked"];

function text(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }

function inputFrom(formData: FormData): SaveSponsorCommitmentInput | { error: string } {
  const sponsorId = text(formData, "sponsorId");
  const kind = text(formData, "kind");
  const title = text(formData, "title");
  const category = text(formData, "category");
  const status = text(formData, "status");
  const totalQuantity = Number(text(formData, "totalQuantity"));
  const completedQuantity = Number(text(formData, "completedQuantity"));
  const dueDate = text(formData, "dueDate") || null;
  const proofUrl = text(formData, "proofUrl") || null;
  if (!sponsorId || !title || !category || !kinds.includes(kind) || !statuses.includes(status)) return { error: "Complete the sponsor, type, title, category and status." };
  if (!Number.isInteger(totalQuantity) || totalQuantity < 1 || totalQuantity > 10_000 || !Number.isInteger(completedQuantity) || completedQuantity < 0 || completedQuantity > totalQuantity) return { error: "Enter valid quantities; completed cannot exceed promised." };
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Choose a valid due date." };
  if (proofUrl) {
    try {
      const url = new URL(proofUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return { error: "Proof link must use http or https." };
    } catch { return { error: "Enter a valid proof link." }; }
  }
  return { sponsorId, kind, title, category, status, totalQuantity, completedQuantity, description: text(formData, "description"), ownerUserId: text(formData, "ownerUserId") || null, dueDate, proofUrl, notes: text(formData, "notes"), visibleToSponsor: formData.get("visibleToSponsor") === "on" };
}

function refresh() { revalidatePath("/admin"); revalidatePath("/admin/sponsor-deliverables"); revalidatePath("/portal/sponsor-benefits"); }

export async function createCommitmentAction(_state: CommitmentActionState, formData: FormData): Promise<CommitmentActionState> {
  const session = await requireAdminSection("sponsor_delivery");
  const input = inputFrom(formData);
  if ("error" in input) return { message: input.error, status: "error" };
  const id = await createSponsorCommitment(input);
  if (id) await recordAuditLog({ action: "sponsor_commitment.created", actorUserId: session.user?.id ?? null, entityId: id, entityType: "sponsor_commitment", metadata: { kind: input.kind, sponsorId: input.sponsorId } });
  refresh();
  return { message: "Commitment created.", status: "success" };
}

export async function updateCommitmentAction(_state: CommitmentActionState, formData: FormData): Promise<CommitmentActionState> {
  const session = await requireAdminSection("sponsor_delivery");
  const id = text(formData, "commitmentId");
  const input = inputFrom(formData);
  if (!id) return { message: "The commitment could not be identified.", status: "error" };
  if ("error" in input) return { message: input.error, status: "error" };
  await updateSponsorCommitment(id, input);
  await recordAuditLog({ action: "sponsor_commitment.updated", actorUserId: session.user?.id ?? null, entityId: id, entityType: "sponsor_commitment", metadata: { completedQuantity: input.completedQuantity, status: input.status, totalQuantity: input.totalQuantity } });
  refresh();
  return { message: "Commitment updated.", status: "success" };
}

export async function deleteCommitmentAction(formData: FormData) {
  const session = await requireAdminSection("sponsor_delivery");
  const id = text(formData, "commitmentId");
  await deleteSponsorCommitment(id);
  await recordAuditLog({ action: "sponsor_commitment.deleted", actorUserId: session.user?.id ?? null, entityId: id, entityType: "sponsor_commitment" });
  refresh();
}
