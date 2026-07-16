"use server";

import { revalidatePath } from "next/cache";
import {
  createProgrammeItem,
  deleteProgrammeItem,
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
  await requireAdminSection("programme");

  const input = programmeItemInput(formData);

  if ("error" in input) {
    return getErrorState(input.error);
  }

  await createProgrammeItem(input);
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
  await requireAdminSection("programme");

  const eventId = textValue(formData, "eventId");
  const input = programmeItemInput(formData);

  if (!eventId) {
    return getErrorState("The programme item could not be identified.");
  }

  if ("error" in input) {
    return getErrorState(input.error);
  }

  await updateProgrammeItem(eventId, input);
  revalidateProgrammePaths();

  return {
    message: "Programme item updated.",
    status: "success",
  };
}

export async function updateProgrammePublicationAction(formData: FormData) {
  await requireAdminSection("programme");

  const eventId = String(formData.get("eventId") ?? "");
  const published = isPublishedValue(formData);

  await updateProgrammePublication(eventId, published);
  revalidateProgrammePaths();
}

export async function deleteProgrammeItemAction(formData: FormData) {
  await requireAdminSection("programme");

  const eventId = textValue(formData, "eventId");

  await deleteProgrammeItem(eventId);
  revalidateProgrammePaths();
}
