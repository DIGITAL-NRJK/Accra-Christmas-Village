"use server";

import { revalidatePath } from "next/cache";
import {
  createIncident,
  createNotification,
  deleteIncident,
  getIncidentById,
  recordAuditLog,
  updateIncident,
  updateIncidentStatus,
  type SaveIncidentInput,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import type { Incident } from "@/lib/types";
import { documentStorage } from "@/lib/storage";

export type IncidentActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const severities: Incident["severity"][] = ["low", "medium", "high", "critical"];
const statuses: Incident["status"][] = ["open", "monitoring", "resolved"];

function textValue(formData: FormData, name: string, fallback = "") {
  return String(formData.get(name) ?? fallback).trim();
}

function errorState(message: string): IncidentActionState {
  return { message, status: "error" };
}

function incidentInput(formData: FormData): SaveIncidentInput | { error: string } {
  const title = textValue(formData, "title");
  const description = textValue(formData, "description");
  const zoneId = textValue(formData, "zoneId");
  const severity = textValue(formData, "severity", "medium") as Incident["severity"];
  const status = textValue(formData, "status", "open") as Incident["status"];
  const occurredAt = new Date(textValue(formData, "occurredAt"));
  const assignedToUserId = textValue(formData, "assignedToUserId") || null;

  if (!title || !description || !zoneId) {
    return { error: "Complete the title, zone and description before saving." };
  }

  if (!severities.includes(severity)) {
    return { error: "Choose a valid severity." };
  }

  if (!statuses.includes(status)) {
    return { error: "Choose a valid status." };
  }

  if (Number.isNaN(occurredAt.getTime())) {
    return { error: "Choose a valid incident date." };
  }

  return {
    description,
    occurredAt,
    severity,
    status,
    title,
    zoneId,
    assignedToUserId,
  };
}

async function storePhoto(formData: FormData, incidentId: string) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { photo: null };
  if (file.size > 5 * 1024 * 1024) return { error: "Upload an incident photo smaller than 5 MB." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { error: "Upload a JPEG, PNG or WebP incident photo." };
  try {
    const stored = await documentStorage.put(file, { organizationId: "incident-photos", requirementId: incidentId });
    return { photo: { photoContentType: stored.contentType, photoFileName: stored.fileName, photoStorageKey: stored.key } };
  } catch (error) {
    console.error("Incident photo upload failed.", { incidentId, error });
    return { error: "The incident photo could not be saved." };
  }
}

async function notifyAssignee(incidentId: string, assigneeId: string | null, title: string, severity: string) {
  if (!assigneeId) return;
  await createNotification({ actionHref: `/admin/incidents?incident=${incidentId}`, audience: "all", body: `You are responsible for the ${severity} incident: ${title}.`, createdByUserId: null, expiresAt: null, organizationId: null, recipientUserId: assigneeId, title: "Incident assigned to you", type: severity === "critical" ? "critical" : "warning" });
}

function revalidateIncidentPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/incidents");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function createIncidentAction(
  _previousState: IncidentActionState,
  formData: FormData,
): Promise<IncidentActionState> {
  const session = await requireAdminSection("incidents");

  const input = incidentInput(formData);

  if ("error" in input) {
    return errorState(input.error);
  }
  const incidentId = crypto.randomUUID();
  const photoResult = await storePhoto(formData, incidentId);
  if ("error" in photoResult) return errorState(photoResult.error ?? "The incident photo could not be saved.");
  await createIncident({ ...input, ...(photoResult.photo ?? {}) }, incidentId);
  await notifyAssignee(incidentId, input.assignedToUserId ?? null, input.title, input.severity);
  await recordAuditLog({ action: "incident.created", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident", metadata: { assignedToUserId: input.assignedToUserId, severity: input.severity, status: input.status, zoneId: input.zoneId } });
  revalidateIncidentPaths();

  return { message: "Incident created.", status: "success" };
}

export async function updateIncidentAction(
  _previousState: IncidentActionState,
  formData: FormData,
): Promise<IncidentActionState> {
  const session = await requireAdminSection("incidents");

  const incidentId = textValue(formData, "incidentId");
  const input = incidentInput(formData);

  if (!incidentId) {
    return errorState("The incident could not be identified.");
  }

  if ("error" in input) {
    return errorState(input.error);
  }
  const previous = await getIncidentById(incidentId);
  if (!previous) return errorState("The incident no longer exists.");
  const photoResult = await storePhoto(formData, incidentId);
  if ("error" in photoResult) return errorState(photoResult.error ?? "The incident photo could not be saved.");
  const photo = photoResult.photo ?? { photoContentType: previous.photoContentType, photoFileName: previous.photoFileName, photoStorageKey: previous.photoStorageKey };
  await updateIncident(incidentId, { ...input, ...photo });
  if (previous.assignedToUserId !== input.assignedToUserId) await notifyAssignee(incidentId, input.assignedToUserId ?? null, input.title, input.severity);
  if (photoResult.photo && previous.photoStorageKey) await documentStorage.delete(previous.photoStorageKey).catch(() => undefined);
  await recordAuditLog({ action: "incident.updated", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident", metadata: { before: { assignedToUserId: previous.assignedToUserId, severity: previous.severity, status: previous.status }, after: { assignedToUserId: input.assignedToUserId, severity: input.severity, status: input.status } } });
  revalidateIncidentPaths();

  return { message: "Incident updated.", status: "success" };
}

export async function updateIncidentStatusAction(formData: FormData) {
  const session = await requireAdminSection("incidents");

  const incidentId = textValue(formData, "incidentId");
  const status = textValue(formData, "status") as Incident["status"];

  if (!incidentId || !statuses.includes(status)) {
    return;
  }

  const incident = await getIncidentById(incidentId);
  if (!incident) return;
  await updateIncidentStatus(incidentId, status);
  if (incident.assignedToUserId && incident.status !== status) {
    await createNotification({ actionHref: `/admin/incidents?incident=${incidentId}`, audience: "all", body: `${incident.title} is now ${status}.`, createdByUserId: session.user?.id ?? null, expiresAt: null, organizationId: null, recipientUserId: incident.assignedToUserId, title: "Incident status updated", type: status === "resolved" ? "success" : "warning" });
  }
  await recordAuditLog({ action: "incident.status_changed", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident", metadata: { before: incident.status, after: status } });
  revalidateIncidentPaths();
}

export async function deleteIncidentAction(formData: FormData) {
  const session = await requireAdminSection("incidents");

  const incidentId = textValue(formData, "incidentId");
  const incident = await getIncidentById(incidentId);
  if (incident?.photoStorageKey) await documentStorage.delete(incident.photoStorageKey).catch(() => undefined);
  await deleteIncident(incidentId);
  await recordAuditLog({ action: "incident.deleted", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident" });
  revalidateIncidentPaths();
}
