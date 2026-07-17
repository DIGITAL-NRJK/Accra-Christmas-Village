"use server";

import { revalidatePath } from "next/cache";
import {
  createNotification,
  createOperationalTask,
  deleteOperationalTask,
  getOperationalTaskById,
  recordAuditLog,
  updateOperationalTaskStatus,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import { documentStorage } from "@/lib/storage";

export type TaskActionState = { message: string; status: "idle" | "error" | "success" };
const statuses = ["todo", "in_progress", "blocked", "done"];
const priorities = ["low", "normal", "high", "urgent"];

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function storeProof(formData: FormData, taskId: string) {
  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return null;
  const stored = await documentStorage.put(file, { organizationId: "task-proofs", requirementId: taskId });
  return { proofContentType: stored.contentType, proofFileName: stored.fileName, proofStorageKey: stored.key };
}

function revalidateTaskPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function createTaskAction(_state: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const session = await requireAdminSection("tasks");
  const title = textValue(formData, "title");
  const taskType = textValue(formData, "taskType");
  const description = textValue(formData, "description");
  const assignedToUserId = textValue(formData, "assignedToUserId") || null;
  const zoneId = textValue(formData, "zoneId") || null;
  const standId = textValue(formData, "standId") || null;
  const priority = textValue(formData, "priority") || "normal";
  const dueAt = new Date(textValue(formData, "dueAt"));
  if (!title || !taskType || Number.isNaN(dueAt.getTime()) || !priorities.includes(priority)) return { message: "Complete the task title, type, priority and deadline.", status: "error" };

  const taskId = crypto.randomUUID();
  const proof = await storeProof(formData, taskId);
  await createOperationalTask({ assignedToUserId, createdByUserId: session.user?.id ?? null, description, dueAt, priority, ...(proof ?? {}), standId, status: "todo", taskType, title, zoneId }, taskId);
  if (assignedToUserId) await createNotification({ actionHref: `/admin/tasks?task=${taskId}`, audience: "all", body: `${title} is due ${dueAt.toLocaleString("en")}.`, createdByUserId: session.user?.id ?? null, expiresAt: null, organizationId: null, recipientUserId: assignedToUserId, title: "Operational task assigned", type: priority === "urgent" ? "critical" : "info" });
  await recordAuditLog({ action: "operational_task.created", actorUserId: session.user?.id ?? null, entityId: taskId, entityType: "operational_task", metadata: { assignedToUserId, dueAt: dueAt.toISOString(), priority, taskType } });
  revalidateTaskPaths();
  return { message: "Operational task created.", status: "success" };
}

export async function updateTaskStatusAction(formData: FormData) {
  const session = await requireAdminSection("tasks");
  const taskId = textValue(formData, "taskId");
  const status = textValue(formData, "status");
  if (!taskId || !statuses.includes(status)) return;
  const previous = await getOperationalTaskById(taskId);
  if (!previous) return;
  const proof = await storeProof(formData, taskId);
  await updateOperationalTaskStatus(taskId, status, proof);
  if (proof && previous.proofStorageKey) await documentStorage.delete(previous.proofStorageKey).catch(() => undefined);
  if (previous.assignedToUserId && previous.status !== status) await createNotification({ actionHref: `/admin/tasks?task=${taskId}`, audience: "all", body: `${previous.title} is now ${status.replaceAll("_", " ")}.`, createdByUserId: session.user?.id ?? null, expiresAt: null, organizationId: null, recipientUserId: previous.assignedToUserId, title: "Task status updated", type: status === "done" ? "success" : "info" });
  await recordAuditLog({ action: "operational_task.status_changed", actorUserId: session.user?.id ?? null, entityId: taskId, entityType: "operational_task", metadata: { before: previous.status, after: status, proofAdded: Boolean(proof) } });
  revalidateTaskPaths();
}

export async function deleteTaskAction(formData: FormData) {
  const session = await requireAdminSection("tasks");
  const taskId = textValue(formData, "taskId");
  const task = await getOperationalTaskById(taskId);
  if (!task) return;
  if (task.proofStorageKey) await documentStorage.delete(task.proofStorageKey).catch(() => undefined);
  await deleteOperationalTask(taskId);
  await recordAuditLog({ action: "operational_task.deleted", actorUserId: session.user?.id ?? null, entityId: taskId, entityType: "operational_task", metadata: { before: { status: task.status, title: task.title } } });
  revalidateTaskPaths();
}
