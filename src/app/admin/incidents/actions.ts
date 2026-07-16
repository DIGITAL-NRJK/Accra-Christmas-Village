"use server";

import { revalidatePath } from "next/cache";
import {
  createIncident,
  deleteIncident,
  recordAuditLog,
  updateIncident,
  updateIncidentStatus,
  type SaveIncidentInput,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import type { Incident } from "@/lib/types";

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
  };
}

function revalidateIncidentPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/incidents");
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

  await createIncident(input);
  await recordAuditLog({ action: "incident.created", actorUserId: session.user?.id ?? null, entityId: input.title, entityType: "incident", metadata: { severity: input.severity, status: input.status, zoneId: input.zoneId } });
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

  await updateIncident(incidentId, input);
  await recordAuditLog({ action: "incident.updated", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident", metadata: { severity: input.severity, status: input.status } });
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

  await updateIncidentStatus(incidentId, status);
  await recordAuditLog({ action: "incident.status_changed", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident", metadata: { status } });
  revalidateIncidentPaths();
}

export async function deleteIncidentAction(formData: FormData) {
  const session = await requireAdminSection("incidents");

  const incidentId = textValue(formData, "incidentId");

  await deleteIncident(incidentId);
  await recordAuditLog({ action: "incident.deleted", actorUserId: session.user?.id ?? null, entityId: incidentId, entityType: "incident" });
  revalidateIncidentPaths();
}
