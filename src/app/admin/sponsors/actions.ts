"use server";

import { revalidatePath } from "next/cache";
import {
  createSponsor,
  deleteSponsor,
  updateSponsor,
  updateSponsorStatus,
  type SaveSponsorInput,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import type { Sponsor } from "@/lib/types";

export type SponsorActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

const packageLevels: Sponsor["packageLevel"][] = ["headline", "gold", "silver", "community"];
const sponsorStatuses: Sponsor["status"][] = ["prospect", "confirmed", "active"];

function textValue(formData: FormData, name: string, fallback = "") {
  return String(formData.get(name) ?? fallback).trim();
}

function getErrorState(message: string): SponsorActionState {
  return { message, status: "error" };
}

function getSponsorInput(formData: FormData): SaveSponsorInput | { error: string } {
  const brandName = textValue(formData, "brandName");
  const contactEmail = textValue(formData, "contactEmail");
  const contactPhone = textValue(formData, "contactPhone");
  const packageLevel = textValue(formData, "packageLevel") as Sponsor["packageLevel"];
  const status = textValue(formData, "status") as Sponsor["status"];
  const standId = textValue(formData, "standId") || null;
  const activationLocation = textValue(formData, "activationLocation", "Pending allocation");
  const summary = textValue(formData, "summary");
  const activationPlan = textValue(formData, "activationPlan");

  if (!brandName || !contactEmail || !summary || !activationPlan) {
    return { error: "Complete brand name, contact email, summary and activation plan." };
  }

  if (!contactEmail.includes("@")) {
    return { error: "Enter a valid contact email." };
  }

  if (!packageLevels.includes(packageLevel)) {
    return { error: "Choose a valid sponsor package." };
  }

  if (!sponsorStatuses.includes(status)) {
    return { error: "Choose a valid sponsor status." };
  }

  return {
    activationLocation,
    activationPlan,
    brandName,
    contactEmail,
    contactPhone,
    packageLevel,
    standId,
    status,
    summary,
  };
}

function revalidateSponsorPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/sponsors");
  revalidatePath("/admin/stands");
  revalidatePath("/sponsors");
}

export async function createSponsorAction(
  _previousState: SponsorActionState,
  formData: FormData,
): Promise<SponsorActionState> {
  await requireAdminSection("sponsors");

  const input = getSponsorInput(formData);

  if ("error" in input) {
    return getErrorState(input.error);
  }

  await createSponsor(input);
  revalidateSponsorPaths();

  return {
    message: "Sponsor created.",
    status: "success",
  };
}

export async function updateSponsorAction(
  _previousState: SponsorActionState,
  formData: FormData,
): Promise<SponsorActionState> {
  await requireAdminSection("sponsors");

  const sponsorId = textValue(formData, "sponsorId");
  const organizationId = textValue(formData, "organizationId");
  const input = getSponsorInput(formData);

  if (!sponsorId || !organizationId) {
    return getErrorState("The sponsor could not be identified.");
  }

  if ("error" in input) {
    return getErrorState(input.error);
  }

  await updateSponsor(sponsorId, organizationId, input);
  revalidateSponsorPaths();

  return {
    message: "Sponsor updated.",
    status: "success",
  };
}

export async function updateSponsorStatusAction(formData: FormData) {
  await requireAdminSection("sponsors");

  const sponsorId = textValue(formData, "sponsorId");
  const status = textValue(formData, "status") as Sponsor["status"];

  if (!sponsorId || !sponsorStatuses.includes(status)) {
    return;
  }

  await updateSponsorStatus(sponsorId, status);
  revalidateSponsorPaths();
}

export async function deleteSponsorAction(formData: FormData) {
  await requireAdminSection("sponsors");

  const sponsorId = textValue(formData, "sponsorId");

  await deleteSponsor(sponsorId);
  revalidateSponsorPaths();
}
