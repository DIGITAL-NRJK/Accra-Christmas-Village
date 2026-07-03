"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cancelAccessRequestForClerkUser, createOrUpdateAccessRequest } from "@/db/queries";
import { getCurrentAppSession } from "@/lib/auth";
import type { ParticipantRole } from "@/lib/types";

const participantRoles: ParticipantRole[] = ["vendor", "sponsor", "partner"];

export async function requestParticipantAccess(formData: FormData) {
  const session = await getCurrentAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  const requestedRole = String(formData.get("requestedRole") ?? "") as ParticipantRole;
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim() || session.name;
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!participantRoles.includes(requestedRole) || !session.email || !organizationName) {
    return;
  }

  await createOrUpdateAccessRequest({
    clerkUserId: session.clerkUserId,
    email: session.email,
    requestedRole,
    organizationName,
    contactName,
    phone,
    message,
  });

  revalidatePath("/portal");
}

export async function cancelParticipantAccessRequest(formData: FormData) {
  const session = await getCurrentAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  const cancellationReason = String(formData.get("cancellationReason") ?? "").trim();

  if (!cancellationReason) {
    return;
  }

  await cancelAccessRequestForClerkUser(session.clerkUserId, cancellationReason);

  revalidatePath("/portal");
}
