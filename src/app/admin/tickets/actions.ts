"use server";

import { revalidatePath } from "next/cache";
import { addSupportMessage, getSupportTicket, recordAuditLog, updateSupportTicket } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export async function replyToSupportTicketAction(formData: FormData) {
  const session = await requireAdminSection("tickets");
  const ticketId = String(formData.get("ticketId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const internal = formData.get("internal") === "on";
  if (!session.user || !body || !(await getSupportTicket(ticketId))) return;
  await addSupportMessage({ ticketId, authorUserId: session.user.id, body, internal });
  await recordAuditLog({ action: internal ? "ticket.note_added" : "ticket.replied", actorUserId: session.user.id, entityId: ticketId, entityType: "support_ticket" });
  revalidatePath("/admin/tickets");
  revalidatePath("/portal/support");
}

export async function updateSupportTicketAction(formData: FormData) {
  const session = await requireAdminSection("tickets");
  const ticketId = String(formData.get("ticketId") ?? "");
  const status = String(formData.get("status") ?? "open");
  const priority = String(formData.get("priority") ?? "normal");
  const assignedToUserId = String(formData.get("assignedToUserId") ?? "") || null;
  if (!ticketId || !["open", "in_progress", "waiting", "resolved", "closed"].includes(status) || !["low", "normal", "high", "urgent"].includes(priority)) return;
  await updateSupportTicket(ticketId, { status, priority, assignedToUserId });
  await recordAuditLog({ action: "ticket.updated", actorUserId: session.user?.id ?? null, entityId: ticketId, entityType: "support_ticket", metadata: { assignedToUserId, priority, status } });
  revalidatePath("/admin/tickets");
  revalidatePath("/portal/support");
}
