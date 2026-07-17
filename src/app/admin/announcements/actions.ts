"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement,
  createNotification,
  deleteAnnouncement,
  getAnnouncementById,
  recordAuditLog,
  updateAnnouncement,
  updateAnnouncementPublication,
  type CreateAnnouncementInput,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

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
  revalidatePath("/notifications");
}

async function publishUrgentNotification(
  input: CreateAnnouncementInput,
  createdByUserId: string | null,
) {
  if (!input.published || input.priority !== "high") return;
  await createNotification({
    actionHref: input.audience === "admin" ? "/admin/announcements" : "/portal/messages",
    audience: input.audience === "admin" ? "internal" : input.audience,
    body: input.body,
    createdByUserId,
    expiresAt: input.endsAt,
    organizationId: null,
    title: input.title,
    type: "critical",
  });
}

export async function createAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireAdminSection("announcements");

  const input = announcementInput(formData);

  if ("error" in input) {
    return getErrorState(input.error);
  }

  const announcementId = await createAnnouncement(input);
  await publishUrgentNotification(input, session.user?.id ?? null);
  await recordAuditLog({ action: "announcement.created", actorUserId: session.user?.id ?? null, entityId: announcementId, entityType: "announcement", metadata: { audience: input.audience, priority: input.priority, published: input.published } });
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
  const session = await requireAdminSection("announcements");

  const announcementId = textValue(formData, "announcementId");
  const input = announcementInput(formData);

  if (!announcementId) {
    return getErrorState("The announcement could not be identified.");
  }

  if ("error" in input) {
    return getErrorState(input.error);
  }

  const previous = await getAnnouncementById(announcementId);
  await updateAnnouncement(announcementId, input);
  if (!previous?.published || previous.priority !== "high") {
    await publishUrgentNotification(input, session.user?.id ?? null);
  }
  await recordAuditLog({ action: "announcement.updated", actorUserId: session.user?.id ?? null, entityId: announcementId, entityType: "announcement", metadata: { before: previous ? { audience: previous.audience, priority: previous.priority, published: previous.published } : null, after: { audience: input.audience, priority: input.priority, published: input.published } } });
  revalidateAnnouncementPaths();

  return {
    message: "Announcement updated.",
    status: "success",
  };
}

export async function updateAnnouncementPublicationAction(formData: FormData) {
  const session = await requireAdminSection("announcements");

  const announcementId = textValue(formData, "announcementId");
  const published = isPublishedValue(formData);

  const announcement = await getAnnouncementById(announcementId);
  await updateAnnouncementPublication(announcementId, published);
  if (announcement && published && !announcement.published) {
    await publishUrgentNotification({ ...announcement, published }, session.user?.id ?? null);
  }
  await recordAuditLog({ action: published ? "announcement.published" : "announcement.unpublished", actorUserId: session.user?.id ?? null, entityId: announcementId, entityType: "announcement" });
  revalidateAnnouncementPaths();
}

export async function deleteAnnouncementAction(formData: FormData) {
  const session = await requireAdminSection("announcements");

  const announcementId = textValue(formData, "announcementId");

  await deleteAnnouncement(announcementId);
  await recordAuditLog({ action: "announcement.deleted", actorUserId: session.user?.id ?? null, entityId: announcementId, entityType: "announcement" });
  revalidateAnnouncementPaths();
}
