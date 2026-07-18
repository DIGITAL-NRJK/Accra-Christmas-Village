"use server";

import { revalidatePath } from "next/cache";
import {
  approveVendorApplication,
  getVendorApplicationById,
  updateVendorApplicationReview,
} from "@/db/vendor-applications";
import {
  approveAccessRequest,
  createNotification,
  findUserByClerkIdentity,
  getAccessRequestById,
  recordAuditLog,
  rejectAccessRequest,
} from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export type VendorReviewActionState = { message: string; status: "idle" | "error" | "success" };

export async function reviewVendorApplicationAction(
  _state: VendorReviewActionState,
  formData: FormData,
): Promise<VendorReviewActionState> {
  const session = await requireAdminSection("vendor_applications");
  const applicationId = String(formData.get("applicationId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("reviewerNote") ?? "").trim().slice(0, 2_000);
  const application = await getVendorApplicationById(applicationId);
  if (!application) return { message: "Vendor application not found.", status: "error" };
  if (!["start_review", "request_changes", "approve", "reject"].includes(decision)) {
    return { message: "Unknown review decision.", status: "error" };
  }
  if (["request_changes", "reject"].includes(decision) && note.length < 10) {
    return { message: "Add a clear note of at least 10 characters for the applicant.", status: "error" };
  }
  if (decision === "start_review" && application.status !== "submitted") {
    return { message: "Only a newly submitted dossier can enter review.", status: "error" };
  }
  if (["request_changes", "approve", "reject"].includes(decision) && !["submitted", "under_review"].includes(application.status)) {
    return { message: "This dossier is not awaiting a review decision.", status: "error" };
  }

  const recipient = application.applicantUserId
    ? { id: application.applicantUserId, organizationId: application.organizationId }
    : await findUserByClerkIdentity(application.clerkUserId, application.contactEmail);
  let notificationTitle = "Vendor application update";
  let notificationBody = note;
  let notificationType = "info";
  let auditAction = "vendor_application.review_started";

  if (decision === "start_review") {
    await updateVendorApplicationReview({ applicationId, note: note || "Your application is being reviewed by the operations team.", reviewerUserId: session.user?.id ?? null, status: "under_review" });
    notificationTitle = "Vendor application under review";
    notificationBody = note || "The operations team has started reviewing your Vendor application.";
  }

  if (decision === "request_changes") {
    await updateVendorApplicationReview({ applicationId, note, reviewerUserId: session.user?.id ?? null, status: "changes_requested" });
    notificationTitle = "Vendor application changes requested";
    notificationBody = note;
    notificationType = "warning";
    auditAction = "vendor_application.changes_requested";
  }

  if (decision === "reject") {
    if (application.accessRequestId) {
      const request = await getAccessRequestById(application.accessRequestId);
      if (request?.status === "pending") await rejectAccessRequest(request.id, note, session.user?.id ?? null);
    }
    await updateVendorApplicationReview({ applicationId, note, reviewerUserId: session.user?.id ?? null, status: "rejected" });
    notificationTitle = "Vendor application not approved";
    notificationBody = note;
    notificationType = "warning";
    auditAction = "vendor_application.rejected";
  }

  if (decision === "approve") {
    if (!application.accessRequestId) return { message: "This application has no linked access request.", status: "error" };
    const request = await getAccessRequestById(application.accessRequestId);
    if (!request) return { message: "The linked access request could not be found.", status: "error" };
    if (request.status !== "approved") {
      await approveAccessRequest(request.id, note || "Vendor application approved by operations.", session.user?.id ?? null);
    }
    const approvedUser = await findUserByClerkIdentity(application.clerkUserId, application.contactEmail);
    if (!approvedUser?.organizationId) return { message: "Access was approved but no Vendor organization was created.", status: "error" };
    await approveVendorApplication({
      applicationId,
      note: note || "Vendor application approved by operations.",
      organizationId: approvedUser.organizationId,
      reviewerUserId: session.user?.id ?? null,
    });
    notificationTitle = "Vendor application approved";
    notificationBody = note || "Your Vendor application is approved. Your participant workspace is now available.";
    notificationType = "success";
    auditAction = "vendor_application.approved";
  }

  const currentRecipient = decision === "approve"
    ? await findUserByClerkIdentity(application.clerkUserId, application.contactEmail)
    : recipient;
  await Promise.all([
    currentRecipient ? createNotification({
      actionHref: "/portal/application",
      audience: "all",
      body: notificationBody,
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: currentRecipient.organizationId,
      recipientUserId: currentRecipient.id,
      title: notificationTitle,
      type: notificationType,
    }) : Promise.resolve(),
    recordAuditLog({
      action: auditAction,
      actorUserId: session.user?.id ?? null,
      entityId: applicationId,
      entityType: "vendor_application",
      metadata: { fromStatus: application.status, note },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/access-requests");
  revalidatePath("/admin/vendor-applications");
  revalidatePath("/admin/vendors");
  revalidatePath("/portal");
  revalidatePath("/portal/application");
  return { message: `Application ${decision.replaceAll("_", " ")} saved.`, status: "success" };
}
