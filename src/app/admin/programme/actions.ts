"use server";

import { revalidatePath } from "next/cache";
import {
  createProgrammeItem,
  deleteProgrammeItem,
  getProgrammeItemById,
  recordAuditLog,
  updateProgrammeItem,
  updateProgrammePublication,
  type SaveProgrammeItemInput,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export type ProgrammeItemActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

function textValue(formData: FormData, name: string, fallback = "") {
  return String(formData.get(name) ?? fallback).trim();
}

function getErrorState(message: string): ProgrammeItemActionState {
  return { message, status: "error" };
}

function isPublishedValue(formData: FormData) {
  const value = formData.get("published");

  return value === "on" || value === "true";
}

function programmeItemInput(formData: FormData): SaveProgrammeItemInput | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const day = String(formData.get("day") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim() || "All visitors";
  const description = String(formData.get("description") ?? "").trim();
  const published = isPublishedValue(formData);

  if (!title || !day || !startsAt || !endsAt || !category || !location || !description) {
    return { error: "Complete title, date, time, category, location and description." };
  }

  if (startsAt >= endsAt) {
    return { error: "End time must be after start time." };
  }

  return {
    title,
    day,
    startsAt,
    endsAt,
    category,
    location,
    audience,
    description,
    published,
  };
}

function revalidateProgrammePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/programme");
  revalidatePath("/programme");
}

export async function createProgrammeItemAction(
  _previousState: ProgrammeItemActionState,
  formData: FormData,
): Promise<ProgrammeItemActionState> {
  const session = await requireAdminSection("programme");

  const input = programmeItemInput(formData);

  if ("error" in input) {
    return getErrorState(input.error);
  }

  const eventId = await createProgrammeItem(input);
  await recordAuditLog({ action: "programme_item.created", actorUserId: session.user?.id ?? null, entityId: eventId, entityType: "programme_item", metadata: { after: input } });
  revalidateProgrammePaths();

  return {
    message: "Programme item created.",
    status: "success",
  };
}

export async function updateProgrammeItemAction(
  _previousState: ProgrammeItemActionState,
  formData: FormData,
): Promise<ProgrammeItemActionState> {
  const session = await requireAdminSection("programme");

  const eventId = textValue(formData, "eventId");
  const input = programmeItemInput(formData);

  if (!eventId) {
    return getErrorState("The programme item could not be identified.");
  }

  if ("error" in input) {
    return getErrorState(input.error);
  }

  const previous = await getProgrammeItemById(eventId);
  await updateProgrammeItem(eventId, input);
  await recordAuditLog({ action: "programme_item.updated", actorUserId: session.user?.id ?? null, entityId: eventId, entityType: "programme_item", metadata: { before: previous, after: input } });
  revalidateProgrammePaths();

  return {
    message: "Programme item updated.",
    status: "success",
  };
}

export async function updateProgrammePublicationAction(formData: FormData) {
  const session = await requireAdminSection("programme");

  const eventId = String(formData.get("eventId") ?? "");
  const published = isPublishedValue(formData);

  const previous = await getProgrammeItemById(eventId);
  await updateProgrammePublication(eventId, published);
  await recordAuditLog({ action: "programme_item.publication_changed", actorUserId: session.user?.id ?? null, entityId: eventId, entityType: "programme_item", metadata: { before: previous?.published ?? null, after: published } });
  revalidateProgrammePaths();
}

export async function deleteProgrammeItemAction(formData: FormData) {
  const session = await requireAdminSection("programme");

  const eventId = textValue(formData, "eventId");

  const previous = await getProgrammeItemById(eventId);
  await deleteProgrammeItem(eventId);
  await recordAuditLog({ action: "programme_item.deleted", actorUserId: session.user?.id ?? null, entityId: eventId, entityType: "programme_item", metadata: { before: previous } });
  revalidateProgrammePaths();
}
