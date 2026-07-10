"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  updateAnnouncementPublication,
  type CreateAnnouncementInput,
} from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export type AnnouncementActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const audiences = ["all", "vendor", "sponsor", "partner", "admin"];
const priorities = ["low", "normal", "high"];

function textValue(formData: FormData, name: string, fallback = "") {
  return String(formData.get(name) ?? fallback).trim();
}

function getErrorState(message: string): AnnouncementActionState {
  return { message, status: "error" };
}

function isPublishedValue(formData: FormData) {
  const value = formData.get("published");

  return value === "on" || value === "true";
}

function parseDateTime(value: string, fallback: Date | null) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function announcementInput(formData: FormData): CreateAnnouncementInput | { error: string } {
  const title = textValue(formData, "title");
  const body = textValue(formData, "body");
  const audience = textValue(formData, "audience", "all");
  const priority = textValue(formData, "priority", "normal");
  const startsAt = parseDateTime(textValue(formData, "startsAt"), new Date());
  const endsAt = parseDateTime(textValue(formData, "endsAt"), null);

  if (!title || !body) {
    return { error: "Complete the title and message before saving." };
  }

  if (!audiences.includes(audience)) {
    return { error: "Choose a valid audience." };
  }

  if (!priorities.includes(priority)) {
    return { error: "Choose a valid priority." };
  }

  if (!startsAt) {
    return { error: "Choose a valid start date." };
  }

  if (endsAt && endsAt <= startsAt) {
    return { error: "End date must be after the start date." };
  }

  return {
    audience,
    body,
    endsAt,
    priority,
    published: isPublishedValue(formData),
    startsAt,
    title,
  };
}

function revalidateAnnouncementPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
  revalidatePath("/portal/messages");
}

export async function createAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  await requireAnyRole(["admin", "super_admin"]);

  const input = announcementInput(formData);

  if ("error" in input) {
    return getErrorState(input.error);
  }

  await createAnnouncement(input);
  revalidateAnnouncementPaths();

  return {
    message: "Announcement created.",
    status: "success",
  };
}

export async function updateAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  await requireAnyRole(["admin", "super_admin"]);

  const announcementId = textValue(formData, "announcementId");
  const input = announcementInput(formData);

  if (!announcementId) {
    return getErrorState("The announcement could not be identified.");
  }

  if ("error" in input) {
    return getErrorState(input.error);
  }

  await updateAnnouncement(announcementId, input);
  revalidateAnnouncementPaths();

  return {
    message: "Announcement updated.",
    status: "success",
  };
}

export async function updateAnnouncementPublicationAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const announcementId = textValue(formData, "announcementId");
  const published = isPublishedValue(formData);

  await updateAnnouncementPublication(announcementId, published);
  revalidateAnnouncementPaths();
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const announcementId = textValue(formData, "announcementId");

  await deleteAnnouncement(announcementId);
  revalidateAnnouncementPaths();
}
