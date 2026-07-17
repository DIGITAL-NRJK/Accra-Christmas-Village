"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addSupportMessage, createSupportTicket, getSupportTicket, recordAuditLog } from "@/db/queries";
import { getCurrentAppSession, isParticipantRole } from "@/lib/auth";

const categories = ["access", "documents", "stand", "billing", "technical", "other"];
const priorities = ["low", "normal", "high", "urgent"];

export async function createTicketAction(formData: FormData) {
  const session = await getCurrentAppSession();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const priority = String(formData.get("priority") ?? "normal");
  if (!session?.user || !session.organization || !isParticipantRole(session.role)) return;
  if (!subject || !message || !categories.includes(category) || !priorities.includes(priority)) return;
  const ticketId = await createSupportTicket({ organizationId: session.organization.id, createdByUserId: session.user.id, subject, category, priority, message });
  if (!ticketId) return;
  await recordAuditLog({ action: "ticket.created", actorUserId: session.user.id, entityId: ticketId, entityType: "support_ticket", metadata: { category, priority } });
  revalidatePath("/portal/support");
  redirect(`/portal/support?ticket=${ticketId}`);
}

export async function replyToTicketAction(formData: FormData) {
  const session = await getCurrentAppSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!session?.user || !session.organization || !body) return;
  const ticket = await getSupportTicket(ticketId);
  if (!ticket || ticket.organizationId !== session.organization.id) return;
  await addSupportMessage({ ticketId, authorUserId: session.user.id, body, internal: false });
  revalidatePath("/portal/support");
}
